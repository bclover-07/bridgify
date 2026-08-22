import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import User from '../models/User.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import Course from '../models/Course.js';
import Assessment from '../models/Assessment.js';
import DriveEvent from '../models/DriveEvent.js';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { v2 as cloudinary } from 'cloudinary';

async function aggregateData(state) {
  const s = Date.now();
  const { institutionId } = state;

  const [totalStudents, totalFaculty, totalCourses, totalAssessments, totalDrives, segEntries] = await Promise.all([
    User.countDocuments({ institutionId, role: 'student' }),
    User.countDocuments({ institutionId, role: 'faculty' }),
    Course.countDocuments({ institutionId }),
    Assessment.countDocuments({ institutionId }),
    DriveEvent.countDocuments({ institutionId }),
    SkillEvidenceGraph.find({ institutionId }).select('confidenceScore skillCategory evidenceType').lean(),
  ]);

  const avgConfidence = segEntries.length > 0 ? segEntries.reduce((s, e) => s + e.confidenceScore, 0) / segEntries.length : 0;
  const categoryDist = {};
  segEntries.forEach(e => { categoryDist[e.skillCategory] = (categoryDist[e.skillCategory] || 0) + 1; });

  return { ...state, metrics: { totalStudents, totalFaculty, totalCourses, totalAssessments, totalDrives, totalSEGEntries: segEntries.length, avgConfidence: Math.round(avgConfidence) }, categoryDist, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'aggregateData', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateDraft(state) {
  const s = Date.now();
  const { metrics, categoryDist, reportType, userId } = state;

  const prompt = `Generate a ${reportType || 'NAAC'} accreditation report draft for an educational institution.

Metrics:
- Students: ${metrics.totalStudents}
- Faculty: ${metrics.totalFaculty}
- Courses: ${metrics.totalCourses}
- Assessments: ${metrics.totalAssessments}
- Placement Drives: ${metrics.totalDrives}
- Skill Evidence Records: ${metrics.totalSEGEntries}
- Average Confidence Score: ${metrics.avgConfidence}%
- Skill Category Distribution: ${JSON.stringify(categoryDist)}

Generate sections:
1. Executive Summary
2. Student Performance Analysis
3. Faculty & Curriculum Overview
4. Skill Development & Assessment Quality
5. Placement & Industry Readiness
6. Key Strengths
7. Areas for Improvement
8. Recommendations

Format in professional Markdown.`;

  let reportText = `# ${reportType || 'NAAC'} Report\n\n## Draft\n\nMetrics summary...`;
  try {
    const result = await otariCallWithRetry({ route: 'naac.report', prompt, userId, options: { temperature: 0.5, maxTokens: 6144 } });
    reportText = result.text;
  } catch { /* use fallback */ }

  return { ...state, reportText, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateDraft', durationMs: Date.now() - s, status: 'success' }] };
}

async function flagIncomplete(state) {
  const s = Date.now();
  const { metrics } = state;
  let flags = [];
  if (metrics.totalAssessments < 10) flags.push('Low number of assessments for NAAC criteria.');
  if (metrics.totalDrives < 2) flags.push('Placement drives below expected benchmark.');
  return { ...state, flags, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'flagIncomplete', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateDocx(state) {
  const s = Date.now();
  const { reportText, reportType } = state;
  
  // Basic generation of docx from markdown using docx library
  const paragraphs = reportText.split('\n').map(line => {
    return new Paragraph({
      children: [new TextRun({ text: line, size: 24 })],
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const b64string = await Packer.toBase64String(doc);
  const dataURI = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + b64string;

  // Upload to cloudinary to get a URL
  let docUrl = null;
  try {
    const uploadRes = await cloudinary.uploader.upload(dataURI, { resource_type: 'raw', format: 'docx', public_id: `report_${Date.now()}` });
    docUrl = uploadRes.secure_url;
  } catch (err) {
    console.error('Docx upload failed:', err.message);
  }

  return { ...state, docUrl, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateDocx', durationMs: Date.now() - s, status: 'success' }] };
}

async function saveResults(state) {
  const s = Date.now();
  return { ...state, report: { text: state.reportText, metrics: state.metrics, generatedAt: new Date().toISOString(), reportType: state.reportType || 'NAAC', docUrl: state.docUrl, flags: state.flags }, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'saveResults', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { institutionId: ch(null), userId: ch(null), reportType: ch('NAAC'), metrics: ch(null), categoryDist: ch({}), reportText: ch(''), flags: ch([]), docUrl: ch(null), report: ch(null), nodesExecuted: ch([]) } });
  graph.addNode('aggregateData', aggregateData);
  graph.addNode('generateDraft', generateDraft);
  graph.addNode('flagIncomplete', flagIncomplete);
  graph.addNode('generateDocx', generateDocx);
  graph.addNode('saveResults', saveResults);
  
  graph.setEntryPoint('aggregateData');
  graph.addEdge('aggregateData', 'generateDraft');
  graph.addEdge('generateDraft', 'flagIncomplete');
  graph.addEdge('flagIncomplete', 'generateDocx');
  graph.addEdge('generateDocx', 'saveResults');
  graph.addEdge('saveResults', END);
  return graph.compile();
}

let compiled = null;

export async function runNAACReport({ institutionId, userId, reportType = 'NAAC' }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'naac_report', otariRouteTag: 'naac.report', triggeredBy: userId, input: { reportType }, status: 'running', modelUsed: 'gemini-1.5-pro' });
  try {
    const result = await compiled.invoke({ institutionId, userId, reportType });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, durationMs });
    return { report: result.report, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runNAACReport };
