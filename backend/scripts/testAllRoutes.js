import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000/api';

let studentToken = '';
let facultyToken = '';
let adminToken = '';
let recruiterToken = '';

let courseId = '';
let assessmentId = '';

async function runTests() {
  console.log('====================================================');
  console.log('      BRIDGIFY BACKEND FULL API & LLM SUITE TEST   ');
  console.log('====================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    details: [],
  };

  async function testEndpoint(name, fn) {
    try {
      console.log(`[TESTING] ${name}...`);
      const res = await fn();
      results.passed++;
      results.details.push({ name, status: 'PASSED', data: res });
      console.log(`  ✅ PASSED - ${name}`);
    } catch (err) {
      results.failed++;
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      results.details.push({ name, status: 'FAILED', error: errMsg, responseData: err.response?.data });
      console.error(`  ❌ FAILED - ${name}:`, errMsg, JSON.stringify(err.response?.data || {}));
    }
  }

  // ----------------------------------------------------
  // 1. AUTHENTICATION & LOGIN
  // ----------------------------------------------------
  console.log('\n--- 1. TESTING AUTHENTICATION ---');

  await testEndpoint('Student Login (arjun@mrdu.edu)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'arjun@mrdu.edu',
      password: 'test123',
    });
    studentToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('Faculty Login (lakshmi.naidu@mrdu.edu)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'lakshmi.naidu@mrdu.edu',
      password: 'faculty123',
    });
    facultyToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('Admin Login (admin@mrdu.edu)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mrdu.edu',
      password: 'admin123',
    });
    adminToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('Recruiter Login (ravi@techspark.com)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ravi@techspark.com',
      password: 'recruiter123',
    });
    recruiterToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('GET Auth Me (Student)', async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    return { name: res.data.user.name, email: res.data.user.email };
  });

  // ----------------------------------------------------
  // 2. STUDENT ROUTES
  // ----------------------------------------------------
  console.log('\n--- 2. TESTING STUDENT ROUTES ---');

  await testEndpoint('GET Student Dashboard', async () => {
    const res = await axios.get(`${BASE_URL}/student/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    return { profile: res.data.profile.name, totalSkills: res.data.stats.totalSkills };
  });

  await testEndpoint('GET Student Readiness (Roles List)', async () => {
    const res = await axios.get(`${BASE_URL}/student/readiness`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    return { totalRoles: res.data.roles?.length };
  });

  await testEndpoint('GET Student Readiness (Target Role: fullstack-developer)', async () => {
    const res = await axios.get(`${BASE_URL}/student/readiness?targetRole=fullstack-developer`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    return { readiness: res.data.overallReadiness, targetRole: res.data.targetRole };
  });

  await testEndpoint('POST Student What-If Readiness', async () => {
    const res = await axios.post(
      `${BASE_URL}/student/readiness/what-if`,
      { targetRole: 'fullstack-developer', hypotheticalScores: { 'python.basics': 90, 'react.basics': 85 } },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    return { current: res.data.currentReadiness, whatIf: res.data.whatIfReadiness };
  });

  await testEndpoint('GET Student SEG', async () => {
    const res = await axios.get(`${BASE_URL}/student/seg`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    return { totalNodes: res.data.nodes?.length, readinessScore: res.data.aggregate?.totalReadinessScore };
  });

  await testEndpoint('GET Student Opportunities', async () => {
    const res = await axios.get(`${BASE_URL}/student/opportunities`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    return { total: res.data.opportunities?.length };
  });

  await testEndpoint('GET Student Benchmarks', async () => {
    const res = await axios.get(`${BASE_URL}/student/benchmarks`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    return { benchmarkCount: res.data.benchmarks?.length };
  });

  await testEndpoint('POST Student Study Plan (Agent 13 LLM Call)', async () => {
    const res = await axios.post(
      `${BASE_URL}/student/study-plan/generate`,
      { targetRole: 'fullstack-developer' },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    return {
      message: res.data.message,
      weeks: res.data.plan?.weeks?.length,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('POST Student Mock Interview Start (Agent 04 Session Init)', async () => {
    const res = await axios.post(
      `${BASE_URL}/student/mock-interview/start`,
      { targetRole: 'fullstack-developer' },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    return { sessionId: res.data.session._id, status: res.data.session.status };
  });

  await testEndpoint('POST Student Debate Start (Agent 05 Session Init)', async () => {
    const res = await axios.post(
      `${BASE_URL}/student/debate/start`,
      { topic: 'AI will replace human software engineers', side: 'against' },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    return { sessionId: res.data.session._id, side: res.data.session.side };
  });

  // ----------------------------------------------------
  // 3. FACULTY ROUTES & AI AGENTS
  // ----------------------------------------------------
  console.log('\n--- 3. TESTING FACULTY ROUTES & LLM AGENTS ---');

  await testEndpoint('GET Faculty Dashboard', async () => {
    const res = await axios.get(`${BASE_URL}/faculty/dashboard`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    if (res.data.courses && res.data.courses.length > 0) {
      courseId = String(res.data.courses[0]._id);
    }
    return { profile: res.data.profile.name, coursesCount: res.data.courses?.length, selectedCourseId: courseId };
  });

  await testEndpoint('GET Faculty Courses', async () => {
    const res = await axios.get(`${BASE_URL}/faculty/courses`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    if (res.data.courses && res.data.courses.length > 0) {
      courseId = String(res.data.courses[0]._id);
    }
    return { courses: res.data.courses?.map(c => c.code), selectedCourseId: courseId };
  });

  await testEndpoint('POST Assessment Generator (Agent 01 LLM Call)', async () => {
    const res = await axios.post(
      `${BASE_URL}/faculty/assessments/generate`,
      { courseId, topic: 'Object Oriented Programming', difficulty: 'mixed', questionCount: 5 },
      { headers: { Authorization: `Bearer ${facultyToken}` } }
    );
    assessmentId = res.data.assessment._id;
    return {
      title: res.data.assessment.title,
      questionsGenerated: res.data.assessment.questions?.length,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('POST Faculty Notes Generator (Agent 03 LLM Call)', async () => {
    const res = await axios.post(
      `${BASE_URL}/faculty/notes/generate`,
      { sourceType: 'text', content: 'Python is an interpreted, high-level, general-purpose programming language. Created by Guido van Rossum.', courseId, title: 'Introduction to Python' },
      { headers: { Authorization: `Bearer ${facultyToken}` } }
    );
    return {
      resourceTitle: res.data.resource.title,
      agentRunId: res.data.agentRunId,
      message: res.data.message,
    };
  });

  await testEndpoint('POST Curriculum Gap Analysis (Agent 07 LLM Call)', async () => {
    const res = await axios.post(
      `${BASE_URL}/faculty/curriculum-gap`,
      { courseId },
      { headers: { Authorization: `Bearer ${facultyToken}` } }
    );
    return {
      alignmentScore: res.data.report?.alignmentScore,
      gapsFound: res.data.report?.gaps?.length,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('GET Faculty Learning Feed', async () => {
    const res = await axios.get(`${BASE_URL}/faculty/learning-feed`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    return { totalDemands: res.data.feed?.length };
  });

  // ----------------------------------------------------
  // 4. RECRUITER ROUTES & AI AGENTS
  // ----------------------------------------------------
  console.log('\n--- 4. TESTING RECRUITER ROUTES & LLM AGENTS ---');

  await testEndpoint('GET Recruiter Dashboard', async () => {
    const res = await axios.get(`${BASE_URL}/recruiter/dashboard`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    return { company: res.data.profile.company };
  });

  await testEndpoint('POST Search Candidates (Structured)', async () => {
    const res = await axios.post(
      `${BASE_URL}/recruiter/search`,
      { minConfidence: 10, limit: 10 },
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    return { totalCandidates: res.data.candidates?.length };
  });

  await testEndpoint('POST Semantic Candidate Search (Embeddings + Vector Search)', async () => {
    const res = await axios.post(
      `${BASE_URL}/recruiter/search/semantic`,
      { jobDescription: 'Looking for a Python Developer with Object Oriented Programming skills', limit: 5 },
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    return { candidatesFound: res.data.candidates?.length };
  });

  await testEndpoint('POST Problem Statement Generator (Agent 08 LLM Call)', async () => {
    const res = await axios.post(
      `${BASE_URL}/recruiter/ps/generate`,
      { rawIdea: 'Build an automated code review bot using Gemini API' },
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    return {
      title: res.data.problemStatement.refined?.title,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('GET Recruiter Problem Statements', async () => {
    const res = await axios.get(`${BASE_URL}/recruiter/ps`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    return { totalPS: res.data.problemStatements?.length };
  });

  await testEndpoint('GET Recruiter Marketplace', async () => {
    const res = await axios.get(`${BASE_URL}/recruiter/marketplace`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    return { totalMarketplacePS: res.data.problemStatements?.length };
  });

  // ----------------------------------------------------
  // 5. ADMIN ROUTES & NAAC REPORT AGENT
  // ----------------------------------------------------
  console.log('\n--- 5. TESTING ADMIN ROUTES & NAAC REPORT AGENT ---');

  await testEndpoint('GET Admin Dashboard', async () => {
    const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return { stats: res.data.stats };
  });

  await testEndpoint('GET Admin Students List', async () => {
    const res = await axios.get(`${BASE_URL}/admin/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return { totalStudents: res.data.pagination.total };
  });

  await testEndpoint('GET Admin Placement Command Center', async () => {
    const res = await axios.get(`${BASE_URL}/admin/placement-cc`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return { totalDrives: res.data.totalDrives, pipeline: res.data.pipeline };
  });

  await testEndpoint('GET Admin Analytics', async () => {
    const res = await axios.get(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return { categories: res.data.skillDistribution?.length };
  });

  await testEndpoint('GET Admin Skill Ledger', async () => {
    const res = await axios.get(`${BASE_URL}/admin/skill-ledger`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return { ledgerSkills: res.data.ledger?.length };
  });

  await testEndpoint('POST Admin NAAC Report Generator (Agent 09 LLM Call)', async () => {
    const res = await axios.post(
      `${BASE_URL}/admin/naac-report/generate`,
      { reportType: 'NAAC' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    return {
      reportType: res.data.report?.reportType,
      agentRunId: res.data.agentRunId,
      docUrl: res.data.report?.docUrl,
    };
  });

  // ----------------------------------------------------
  // 6. AGENT RUNS AUDIT LOGS
  // ----------------------------------------------------
  console.log('\n--- 6. TESTING AGENT MONITORING ROUTES ---');

  await testEndpoint('GET Agent System Status Overview', async () => {
    const res = await axios.get(`${BASE_URL}/agents/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return { overview: res.data.overview, agentStats: res.data.agentStats };
  });

  await testEndpoint('GET Agent Runs Log List', async () => {
    const res = await axios.get(`${BASE_URL}/agents/runs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return { totalRuns: res.data.pagination.total };
  });

  // ----------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('                   TEST RESULTS SUMMARY              ');
  console.log('====================================================');
  console.log(`  PASSED: ${results.passed}`);
  console.log(`  FAILED: ${results.failed}`);
  console.log(`  TOTAL:  ${results.passed + results.failed}`);
  console.log('====================================================\n');
}

runTests();
