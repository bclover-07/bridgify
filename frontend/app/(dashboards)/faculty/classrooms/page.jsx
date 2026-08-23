"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiUsers, FiSearch, FiSend, FiAlertTriangle, FiBookOpen, FiEdit3, FiUserCheck, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function MyClassroomsPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Student Detail Modal State
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [remedialTopic, setRemedialTopic] = useState('');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = () => {
    setLoading(true);
    api.get('/faculty/classrooms')
      .then(res => {
        setClassrooms(res.data.classrooms || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleInspectStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    setDetailLoading(true);
    setStudentDetail(null);
    try {
      const res = await api.get(`/faculty/students/${studentId}/detail`);
      setStudentDetail(res.data);
    } catch (err) {
      console.error(err);
    }
    setDetailLoading(false);
  };

  const handleSendNudge = async () => {
    if (!selectedStudentId) return;
    setActionLoading(true);
    try {
      await api.post(`/faculty/students/${selectedStudentId}/nudge`, {
        message: 'Checking in regarding your classroom engagement and SEG readiness.',
        type: 'nudge'
      });
      alert('Nudge sent to student in real-time!');
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message));
    }
    setActionLoading(false);
  };

  const handleAssignRemedial = async () => {
    if (!selectedStudentId) return;
    setActionLoading(true);
    try {
      await api.post(`/faculty/students/${selectedStudentId}/assign-remedial`, {
        topic: remedialTopic || 'Targeted Concept Practice',
        description: 'Faculty assigned practice task to boost placement readiness score.',
      });
      alert('Targeted remedial practice assignment dispatched to student!');
      setRemedialTopic('');
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message));
    }
    setActionLoading(false);
  };

  if (loading) return <DashboardSkeleton />;

  const activeClass = classrooms[selectedClassIndex] || classrooms[0];
  const studentsList = activeClass?.students || [];

  const filteredStudents = studentsList.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || s.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">🏫 My Classrooms & Student Roster</h1>
          <p className="text-gray-500 font-medium">Manage subject cohorts, inspect student profiles, and assign targeted interventions</p>
        </div>
      </StaggerItem>

      {/* Classroom Switcher Tabs */}
      {classrooms.length > 0 && (
        <StaggerItem className="flex flex-wrap gap-3">
          {classrooms.map((cls, idx) => (
            <NeuButton
              key={cls.courseId || idx}
              variant={selectedClassIndex === idx ? 'primary' : 'ghost'}
              onClick={() => setSelectedClassIndex(idx)}
              className="py-3 px-5 text-sm"
            >
              📚 {cls.code} - {cls.title} ({cls.totalStudents} Students)
            </NeuButton>
          ))}
        </StaggerItem>
      )}

      {activeClass && (
        <>
          {/* Class Summary Metrics */}
          <StaggerItem className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeuCard className="p-4 bg-white text-center">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Class Enrolled</p>
              <p className="text-3xl font-extrabold">{activeClass.totalStudents}</p>
            </NeuCard>

            <NeuCard className="p-4 bg-[var(--sky)] text-center">
              <p className="text-xs font-bold text-gray-700 uppercase mb-1">Avg Attendance</p>
              <p className="text-3xl font-extrabold">{activeClass.avgAttendance}%</p>
            </NeuCard>

            <NeuCard className="p-4 bg-[var(--mint)] text-center">
              <p className="text-xs font-bold text-gray-700 uppercase mb-1">Avg Internal Score</p>
              <p className="text-3xl font-extrabold">{activeClass.avgInternal}%</p>
            </NeuCard>

            <NeuCard className="p-4 bg-[var(--coral)] text-white text-center">
              <p className="text-xs font-bold opacity-80 uppercase mb-1">High Risk Students</p>
              <p className="text-3xl font-extrabold">{activeClass.highRiskCount}</p>
            </NeuCard>
          </StaggerItem>

          {/* Roster Controls */}
          <StaggerItem className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 border-[3px] border-[var(--ink)] rounded-2xl">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                className="neu-input pl-9 w-full text-sm"
                placeholder="Search by student name or roll..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                className="neu-select text-sm"
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk Only</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk / On Track</option>
              </select>
            </div>
          </StaggerItem>

          {/* Student Roster Table */}
          <StaggerItem>
            <NeuCard className="p-6 bg-white space-y-4">
              <h2 className="text-xl font-bold">Students Enrolled in {activeClass.code}</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase">
                      <th className="p-3">Student</th>
                      <th className="p-3">Roll & Branch</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3">Internal Score</th>
                      <th className="p-3">SEG Readiness</th>
                      <th className="p-3">Risk Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-semibold">
                    {filteredStudents.map((st, i) => (
                      <tr key={st.studentId || i} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[var(--electric)] text-white flex items-center justify-center font-bold text-sm">
                              {st.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{st.name}</span>
                              <span className="text-xs text-gray-500 font-normal">{st.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-gray-600">
                          <span className="font-bold block">{st.rollNo}</span>
                          <span className="text-xs text-gray-400">{st.branch}</span>
                        </td>

                        <td className="p-3">
                          <NeuBadge variant={st.attendanceRate < 75 ? 'danger' : 'success'}>
                            {st.attendanceRate}%
                          </NeuBadge>
                        </td>

                        <td className="p-3 font-bold text-[var(--electric)]">
                          {st.internalScore}%
                        </td>

                        <td className="p-3 font-bold text-gray-800">
                          {st.placementReadinessScore}%
                        </td>

                        <td className="p-3">
                          <NeuBadge variant={st.riskLevel === 'HIGH' ? 'danger' : st.riskLevel === 'MEDIUM' ? 'warning' : 'success'}>
                            {st.riskLevel}
                          </NeuBadge>
                        </td>

                        <td className="p-3">
                          <NeuButton
                            size="xs"
                            variant="primary"
                            onClick={() => handleInspectStudent(st.studentId)}
                          >
                            Inspect Profile
                          </NeuButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NeuCard>
          </StaggerItem>
        </>
      )}

      {/* Inspect Student Profile Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-[4px] border-[var(--ink)] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-[8px_8px_0px_#000]">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-xs font-bold text-[var(--electric)] uppercase">Detailed Student Inspector</span>
                <h2 className="text-2xl font-bold mt-0.5">{studentDetail?.student?.name || 'Loading Student...'}</h2>
                <p className="text-xs text-gray-500">{studentDetail?.student?.email} • Roll: {studentDetail?.student?.rollNo}</p>
              </div>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="w-8 h-8 rounded-full border-2 border-[var(--ink)] bg-gray-100 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center font-bold">Fetching comprehensive student metrics...</div>
            ) : studentDetail ? (
              <div className="space-y-6">
                {/* Academic Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl">
                    <span className="text-xs font-bold text-gray-500 block">CGPA</span>
                    <span className="text-2xl font-extrabold text-[var(--electric)]">{studentDetail.student.cgpa}</span>
                  </div>

                  <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl">
                    <span className="text-xs font-bold text-gray-500 block">Attendance</span>
                    <span className="text-2xl font-extrabold">{studentDetail.student.attendancePercentage}%</span>
                  </div>

                  <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl">
                    <span className="text-xs font-bold text-gray-500 block">SEG Readiness</span>
                    <span className="text-2xl font-extrabold text-emerald-600">{studentDetail.student.placementReadinessScore}%</span>
                  </div>

                  <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl">
                    <span className="text-xs font-bold text-gray-500 block">Submissions</span>
                    <span className="text-2xl font-extrabold">{studentDetail.submissions?.length || 0}</span>
                  </div>
                </div>

                {/* Submissions History */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-800">Recent Assessment Submissions</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {studentDetail.submissions?.map(sub => (
                      <div key={sub._id} className="p-3 border-2 border-gray-200 rounded-xl bg-gray-50 flex justify-between items-center text-xs font-semibold">
                        <span>{sub.assessmentId?.title || 'Practice Task'}</span>
                        <NeuBadge variant={sub.percentage >= 60 ? 'success' : 'danger'}>
                          {sub.percentage}%
                        </NeuBadge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Faculty Interventions Action Bar */}
                <div className="pt-4 border-t-2 border-gray-100 space-y-3">
                  <h3 className="font-bold text-sm text-gray-800">Execute Faculty Interventions</h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <NeuButton variant="primary" icon={FiSend} onClick={handleSendNudge} loading={actionLoading}>
                      Send Direct Nudge
                    </NeuButton>

                    <NeuButton variant="accent" icon={FiUserCheck} onClick={() => alert('Student recommended for Peer Mentorship program!')}>
                      Recommend Peer Mentor
                    </NeuButton>
                  </div>

                  <div className="p-4 border-2 border-[var(--ink)] rounded-xl bg-[var(--paper)] space-y-2">
                    <span className="text-xs font-bold block text-gray-700">Assign Targeted Remedial Task:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="neu-input text-xs flex-1"
                        placeholder="Topic e.g. Recursion & Dynamic Programming"
                        value={remedialTopic}
                        onChange={e => setRemedialTopic(e.target.value)}
                      />
                      <NeuButton size="sm" variant="sky" icon={FiBookOpen} onClick={handleAssignRemedial} loading={actionLoading}>
                        Assign Task
                      </NeuButton>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
