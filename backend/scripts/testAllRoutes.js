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

  const apiCall = (token) => {
    return axios.create({
      baseURL: BASE_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    const res = await apiCall().post('/auth/login', {
      email: 'arjun@mrdu.edu',
      password: 'test123',
    });
    studentToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('Faculty Login (lakshmi.naidu@mrdu.edu)', async () => {
    const res = await apiCall().post('/auth/login', {
      email: 'lakshmi.naidu@mrdu.edu',
      password: 'faculty123',
    });
    facultyToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('Admin Login (admin@mrdu.edu)', async () => {
    const res = await apiCall().post('/auth/login', {
      email: 'admin@mrdu.edu',
      password: 'admin123',
    });
    adminToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('Recruiter Login (ravi@techspark.com)', async () => {
    const res = await apiCall().post('/auth/login', {
      email: 'ravi@techspark.com',
      password: 'recruiter123',
    });
    recruiterToken = res.data.accessToken;
    return { user: res.data.user.name, role: res.data.user.role };
  });

  await testEndpoint('GET Auth Me (Student)', async () => {
    const res = await apiCall(studentToken).get('/auth/me');
    return { name: res.data.user.name, email: res.data.user.email };
  });

  // ----------------------------------------------------
  // 2. STUDENT ROUTES
  // ----------------------------------------------------
  console.log('\n--- 2. TESTING STUDENT ROUTES ---');

  await testEndpoint('GET Student Dashboard', async () => {
    const res = await apiCall(studentToken).get('/student/dashboard');
    return { profile: res.data.profile.name, totalSkills: res.data.stats.totalSkills };
  });

  await testEndpoint('GET Student Readiness (Roles List)', async () => {
    const res = await apiCall(studentToken).get('/student/readiness');
    return { totalRoles: res.data.roles?.length };
  });

  await testEndpoint('GET Student Readiness (Target Role: fullstack-developer)', async () => {
    const res = await apiCall(studentToken).get('/student/readiness?targetRole=fullstack-developer');
    return { readiness: res.data.overallReadiness, targetRole: res.data.targetRole };
  });

  await testEndpoint('POST Student What-If Readiness', async () => {
    const res = await apiCall(studentToken).post(
      '/student/readiness/what-if',
      { targetRole: 'fullstack-developer', hypotheticalScores: { 'python.basics': 90, 'react.basics': 85 } }
    );
    return { current: res.data.currentReadiness, whatIf: res.data.whatIfReadiness };
  });

  await testEndpoint('GET Student SEG', async () => {
    const res = await apiCall(studentToken).get('/student/seg');
    return { totalNodes: res.data.nodes?.length, readinessScore: res.data.aggregate?.totalReadinessScore };
  });

  await testEndpoint('GET Student Opportunities', async () => {
    const res = await apiCall(studentToken).get('/student/opportunities');
    return { total: res.data.opportunities?.length };
  });

  await testEndpoint('GET Student Benchmarks', async () => {
    const res = await apiCall(studentToken).get('/student/benchmarks');
    return { benchmarkCount: res.data.benchmarks?.length };
  });

  await testEndpoint('POST Student Study Plan (Agent 13 LLM Call)', async () => {
    const res = await apiCall(studentToken).post(
      '/student/study-plan/generate',
      { targetRole: 'fullstack-developer' }
    );
    return {
      message: res.data.message,
      weeks: res.data.plan?.weeks?.length,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('POST Student Mock Interview Start (Agent 04 Session Init)', async () => {
    const res = await apiCall(studentToken).post(
      '/student/mock-interview/start',
      { targetRole: 'fullstack-developer' }
    );
    return { sessionId: res.data.session._id, status: res.data.session.status };
  });

  await testEndpoint('POST Student Debate Start (Agent 05 Session Init)', async () => {
    const res = await apiCall(studentToken).post(
      '/student/debate/start',
      { topic: 'AI will replace human software engineers', side: 'against' }
    );
    return { sessionId: res.data.session._id, side: res.data.session.side };
  });

  await testEndpoint('POST Student Onboarding Paths', async () => {
    const res = await apiCall(studentToken).post(
      '/student/readiness/onboard-path',
      { targetRole: 'fullstack-developer', interests: ['React', 'Python', 'ML'] }
    );
    return { pathsCount: res.data.paths?.length, selectedPathId: res.data.selectedPathId };
  });

  await testEndpoint('POST Student Toggle Milestone Goal', async () => {
    const res = await apiCall(studentToken).post('/student/milestones/toggle', {
      targetRole: 'fullstack-developer',
      goalId: 'w1-g1',
      done: true,
    });
    return { message: res.data.message, goalId: res.data.goalId };
  });

  await testEndpoint('POST Student Select Path', async () => {
    const res = await apiCall(studentToken).post(
      '/student/readiness/select-path',
      { targetRole: 'fullstack-developer', pathId: 'path_specialist' }
    );
    return { title: res.data.activePath?.title };
  });

  await testEndpoint('GET Student Assignments', async () => {
    const res = await apiCall(studentToken).get('/student/assignments');
    return { count: res.data.assignments?.length };
  });

  await testEndpoint('POST Student Submit Assignment Practice', async () => {
    const res = await apiCall(studentToken).post(
      '/student/assignments/submit',
      { skillId: 'dsa.basics', score: 100, topicName: 'Data Structures' }
    );
    return { message: res.data.message, scoreAdded: res.data.scoreAdded };
  });

  await testEndpoint('POST Student AI Code Review', async () => {
    const res = await apiCall(studentToken).post(
      '/student/code/ai-review',
      { code: 'function add(a, b) { return a + b; }', language: 'javascript' }
    );
    return { hasErrors: res.data.review?.hasErrors, timeComplexity: res.data.review?.timeComplexity };
  });

  await testEndpoint('GET Student Leaderboard', async () => {
    const res = await apiCall(studentToken).get('/student/leaderboard');
    return { myRank: res.data.myRank, totalStudents: res.data.totalStudents };
  });

  await testEndpoint('GET Student Academic Profile', async () => {
    const res = await apiCall(studentToken).get('/student/profile/academics');
    return { name: res.data.profile?.name, cgpa: res.data.profile?.cgpa };
  });

  // ----------------------------------------------------
  // 3. FACULTY ROUTES & AI AGENTS
  // ----------------------------------------------------
  console.log('\n--- 3. TESTING FACULTY ROUTES & LLM AGENTS ---');

  await testEndpoint('GET Faculty Dashboard', async () => {
    const res = await apiCall(facultyToken).get('/faculty/dashboard');
    if (res.data.courses && res.data.courses.length > 0) {
      courseId = String(res.data.courses[0]._id);
    }
    return { profile: res.data.profile.name, coursesCount: res.data.courses?.length, selectedCourseId: courseId };
  });

  await testEndpoint('GET Faculty Courses', async () => {
    const res = await apiCall(facultyToken).get('/faculty/courses');
    if (res.data.courses && res.data.courses.length > 0) {
      courseId = String(res.data.courses[0]._id);
    }
    return { courses: res.data.courses?.map(c => c.code), selectedCourseId: courseId };
  });

  await testEndpoint('POST Assessment Generator (Agent 01 LLM Call)', async () => {
    if (!courseId) {
      const cRes = await apiCall(facultyToken).get('/faculty/courses');
      if (cRes.data.courses?.length > 0) courseId = cRes.data.courses[0]._id;
    }
    const res = await apiCall(facultyToken).post(
      '/faculty/assessments/generate',
      { courseId, topic: 'Object Oriented Programming', difficulty: 'mixed', questionCount: 5 }
    );
    assessmentId = res.data.assessment._id;
    return {
      title: res.data.assessment.title,
      questionsGenerated: res.data.assessment.questions?.length,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('POST Faculty Notes Generator (Agent 03 LLM Call)', async () => {
    const res = await apiCall(facultyToken).post(
      '/faculty/notes/generate',
      { sourceType: 'text', content: 'Python is an interpreted, high-level, general-purpose programming language. Created by Guido van Rossum.', courseId, title: 'Introduction to Python' }
    );
    return {
      resourceTitle: res.data.resource.title,
      agentRunId: res.data.agentRunId,
      message: res.data.message,
    };
  });

  await testEndpoint('POST Curriculum Gap Analysis (Agent 07 LLM Call)', async () => {
    const res = await apiCall(facultyToken).post(
      '/faculty/curriculum-gap',
      { courseId }
    );
    return {
      alignmentScore: res.data.report?.alignmentScore,
      gapsFound: res.data.report?.gaps?.length,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('GET Faculty Learning Feed', async () => {
    const res = await apiCall(facultyToken).get('/faculty/learning-feed');
    return { totalDemands: res.data.feed?.length };
  });

  await testEndpoint('POST Faculty Import Student Marks', async () => {
    const res = await apiCall(facultyToken).post('/faculty/students/import-marks', {
      studentMarks: [
        { email: 'arjun@mrdu.edu', rollNo: '21MR1A0501', cgpa: 9.1 }
      ]
    });
    return { updatedCount: res.data.updatedCount, message: res.data.message };
  });

  await testEndpoint('POST Faculty OCR Notes Generator', async () => {
    const res = await apiCall(facultyToken).post('/faculty/notes/ocr-generate', {
      title: 'Data Structures Lecture OCR',
      noteContent: 'Binary Search Trees: Left child < parent, right child > parent. Time complexity: O(log N).',
    });
    return { message: res.data.message, topicsCount: res.data.topics?.length };
  });

  await testEndpoint('POST Faculty Lecture Bridge Auto-Assign', async () => {
    const res = await apiCall(facultyToken).post('/faculty/lecture-bridge/auto-assign', {
      title: 'Lecture Practice Assignment',
      noteContent: 'Tree Traversal: Preorder, Inorder, Postorder traversal techniques.',
    });
    return { title: res.data.assessment?.title, questionsCount: res.data.assessment?.questions?.length };
  });

  await testEndpoint('GET Faculty Classrooms', async () => {
    const res = await apiCall(facultyToken).get('/faculty/classrooms');
    return { classroomsCount: res.data.classrooms?.length };
  });

  // ----------------------------------------------------
  // 4. RECRUITER ROUTES & AI AGENTS
  // ----------------------------------------------------
  console.log('\n--- 4. TESTING RECRUITER ROUTES & LLM AGENTS ---');

  await testEndpoint('GET Recruiter Dashboard', async () => {
    const res = await apiCall(recruiterToken).get('/recruiter/dashboard');
    return { company: res.data.profile.company };
  });

  await testEndpoint('POST Search Candidates (Structured)', async () => {
    const res = await apiCall(recruiterToken).post(
      '/recruiter/search',
      { minConfidence: 10, limit: 10 }
    );
    return { totalCandidates: res.data.candidates?.length };
  });

  await testEndpoint('POST Semantic Candidate Search (Embeddings + Vector Search)', async () => {
    const res = await apiCall(recruiterToken).post(
      '/recruiter/search/semantic',
      { jobDescription: 'Looking for a Python Developer with Object Oriented Programming skills', limit: 5 }
    );
    return { candidatesFound: res.data.candidates?.length };
  });

  await testEndpoint('POST Problem Statement Generator (Agent 08 LLM Call)', async () => {
    const res = await apiCall(recruiterToken).post(
      '/recruiter/ps/generate',
      { rawIdea: 'Build an automated code review bot using Gemini API' }
    );
    return {
      title: res.data.problemStatement.title || res.data.problemStatement.refined?.title,
      agentRunId: res.data.agentRunId,
    };
  });

  await testEndpoint('GET Recruiter Problem Statements', async () => {
    const res = await apiCall(recruiterToken).get('/recruiter/ps');
    return { totalPS: res.data.problemStatements?.length };
  });

  await testEndpoint('GET Recruiter Marketplace', async () => {
    const res = await apiCall(recruiterToken).get('/recruiter/marketplace');
    return { totalMarketplacePS: res.data.problemStatements?.length };
  });

  // ----------------------------------------------------
  // 5. ADMIN ROUTES & NAAC REPORT AGENT
  // ----------------------------------------------------
  console.log('\n--- 5. TESTING ADMIN ROUTES & NAAC REPORT AGENT ---');

  await testEndpoint('GET Admin Dashboard', async () => {
    const res = await apiCall(adminToken).get('/admin/dashboard');
    return { stats: res.data.stats };
  });

  await testEndpoint('GET Admin Students List', async () => {
    const res = await apiCall(adminToken).get('/admin/students');
    return { totalStudents: res.data.pagination.total };
  });

  await testEndpoint('GET Admin Placement Command Center', async () => {
    const res = await apiCall(adminToken).get('/admin/placement-cc');
    return { totalDrives: res.data.totalDrives, pipeline: res.data.pipeline };
  });

  await testEndpoint('GET Admin Analytics', async () => {
    const res = await apiCall(adminToken).get('/admin/analytics');
    return { categories: res.data.skillDistribution?.length };
  });

  await testEndpoint('GET Admin Skill Ledger', async () => {
    const res = await apiCall(adminToken).get('/admin/skill-ledger');
    return { ledgerSkills: res.data.ledger?.length };
  });

  await testEndpoint('POST Admin NAAC Report Generator (Agent 09 LLM Call)', async () => {
    const res = await apiCall(adminToken).post(
      '/admin/naac-report/generate',
      { reportType: 'NAAC' }
    );
    return {
      reportType: res.data.report?.reportType || 'NAAC',
      agentRunId: res.data.agentRunId,
    };
  });

  // ----------------------------------------------------
  // 6. AGENT RUNS AUDIT LOGS
  // ----------------------------------------------------
  console.log('\n--- 6. TESTING AGENT MONITORING ROUTES ---');

  await testEndpoint('GET Agent System Status Overview', async () => {
    const res = await apiCall(adminToken).get('/agents/status');
    return { overview: res.data.overview, agentStats: res.data.agentStats };
  });

  await testEndpoint('GET Agent Runs Log List', async () => {
    const res = await apiCall(adminToken).get('/agents/runs');
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
