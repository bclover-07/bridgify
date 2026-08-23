import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/student/screens/student_layout.dart';
import '../../features/student/screens/dashboard_screen.dart';
import '../../features/student/screens/readiness_simulator_screen.dart';
import '../../features/student/screens/learning_path_screen.dart';
import '../../features/student/screens/study_hub_screen.dart';
import '../../features/student/screens/soft_skills_screen.dart';
import '../../features/student/screens/wallet_screen.dart';
import '../../features/student/screens/opportunities_screen.dart';
import '../../features/student/screens/benchmarks_screen.dart';
import '../../features/student/screens/assessments_screen.dart';
import '../../features/student/screens/student_assignments_screen.dart';
import '../../features/student/screens/student_profile_screen.dart';
import '../../features/student/screens/student_leaderboard_screen.dart';

import '../../features/faculty/screens/faculty_layout.dart';
import '../../features/faculty/screens/faculty_dashboard_screen.dart';
import '../../features/faculty/screens/notes_screen.dart';
import '../../features/faculty/screens/ppt_maker_screen.dart';
import '../../features/faculty/screens/dropout_radar_screen.dart';
import '../../features/faculty/screens/assessments_screen.dart';
import '../../features/faculty/screens/cohort_heatmap_screen.dart';
import '../../features/faculty/screens/lecture_bridge_screen.dart';
import '../../features/faculty/screens/mentorship_screen.dart';
import '../../features/faculty/screens/learning_feed_screen.dart';
import '../../features/faculty/screens/faculty_classrooms_screen.dart';
import '../../features/faculty/screens/faculty_curriculum_gap_screen.dart';

import '../../features/admin/screens/admin_layout.dart';
import '../../features/admin/screens/admin_dashboard_screen.dart';
import '../../features/admin/screens/student_directory_screen.dart';
import '../../features/admin/screens/placement_cc_screen.dart';
import '../../features/admin/screens/naac_report_screen.dart';
import '../../features/admin/screens/skill_ledger_screen.dart';
import '../../features/admin/screens/analytics_screen.dart';

import '../../features/recruiter/screens/recruiter_layout.dart';
import '../../features/recruiter/screens/recruiter_dashboard_screen.dart';
import '../../features/recruiter/screens/candidate_search_screen.dart';
import '../../features/recruiter/screens/ps_generator_screen.dart';
import '../../features/recruiter/screens/marketplace_screen.dart';
import '../../features/recruiter/screens/pipeline_screen.dart';
import '../../features/recruiter/screens/fair_hiring_screen.dart';
import '../../features/recruiter/screens/feedback_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(),
    ),
    ShellRoute(
      builder: (context, state, child) => StudentLayout(child: child),
      routes: [
        GoRoute(
          path: '/student',
          builder: (context, state) => const StudentDashboardScreen(),
        ),
        GoRoute(
          path: '/student/readiness',
          builder: (context, state) => const ReadinessSimulatorScreen(),
        ),
        GoRoute(
          path: '/student/learning-path',
          builder: (context, state) => const LearningPathScreen(),
        ),
        GoRoute(
          path: '/student/study-hub',
          builder: (context, state) => const StudyHubScreen(),
        ),
        GoRoute(
          path: '/student/soft-skills',
          builder: (context, state) => const SoftSkillsScreen(),
        ),
        GoRoute(
          path: '/student/wallet',
          builder: (context, state) => const WalletScreen(),
        ),
        GoRoute(
          path: '/student/opportunities',
          builder: (context, state) => const OpportunitiesScreen(),
        ),
        GoRoute(
          path: '/student/benchmarks',
          builder: (context, state) => const BenchmarksScreen(),
        ),
        GoRoute(
          path: '/student/assessments',
          builder: (context, state) => const AssessmentsScreen(),
        ),
        GoRoute(
          path: '/student/assignments',
          builder: (context, state) => const StudentAssignmentsScreen(),
        ),
        GoRoute(
          path: '/student/profile',
          builder: (context, state) => const StudentProfileScreen(),
        ),
        GoRoute(
          path: '/student/leaderboard',
          builder: (context, state) => const StudentLeaderboardScreen(),
        ),
      ],
    ),
    ShellRoute(
      builder: (context, state, child) => FacultyLayout(child: child),
      routes: [
        GoRoute(
          path: '/faculty',
          builder: (context, state) => const FacultyDashboardScreen(),
        ),
        GoRoute(
          path: '/faculty/notes',
          builder: (context, state) => const NotesScreen(),
        ),
        GoRoute(
          path: '/faculty/ppt_maker',
          builder: (context, state) => const PPTMakerScreen(),
        ),
        GoRoute(
          path: '/faculty/dropout_radar',
          builder: (context, state) => const DropoutRadarScreen(),
        ),
        GoRoute(
          path: '/faculty/assessments',
          builder: (context, state) => const FacultyAssessmentsScreen(),
        ),
        GoRoute(
          path: '/faculty/cohort_heatmap',
          builder: (context, state) => const CohortHeatmapScreen(),
        ),
        GoRoute(
          path: '/faculty/lecture_bridge',
          builder: (context, state) => const LectureBridgeScreen(),
        ),
        GoRoute(
          path: '/faculty/mentorship',
          builder: (context, state) => const MentorshipScreen(),
        ),
        GoRoute(
          path: '/faculty/learning_feed',
          builder: (context, state) => const LearningFeedScreen(),
        ),
        GoRoute(
          path: '/faculty/classrooms',
          builder: (context, state) => const FacultyClassroomsScreen(),
        ),
        GoRoute(
          path: '/faculty/curriculum_gap',
          builder: (context, state) => const FacultyCurriculumGapScreen(),
        ),
      ],
    ),
    ShellRoute(
      builder: (context, state, child) => AdminLayout(child: child),
      routes: [
        GoRoute(
          path: '/admin',
          builder: (context, state) => const AdminDashboardScreen(),
        ),
        GoRoute(
          path: '/admin/student_directory',
          builder: (context, state) => const StudentDirectoryScreen(),
        ),
        GoRoute(
          path: '/admin/placement_cc',
          builder: (context, state) => const PlacementCCScreen(),
        ),
        GoRoute(
          path: '/admin/naac_report',
          builder: (context, state) => const NAACReportScreen(),
        ),
        GoRoute(
          path: '/admin/skill_ledger',
          builder: (context, state) => const SkillLedgerScreen(),
        ),
        GoRoute(
          path: '/admin/analytics',
          builder: (context, state) => const AnalyticsScreen(),
        ),
      ],
    ),
    ShellRoute(
      builder: (context, state, child) => RecruiterLayout(child: child),
      routes: [
        GoRoute(
          path: '/recruiter',
          builder: (context, state) => const RecruiterDashboardScreen(),
        ),
        GoRoute(
          path: '/recruiter/candidate_search',
          builder: (context, state) => const CandidateSearchScreen(),
        ),
        GoRoute(
          path: '/recruiter/ps_generator',
          builder: (context, state) => const PsGeneratorScreen(),
        ),
        GoRoute(
          path: '/recruiter/marketplace',
          builder: (context, state) => const MarketplaceScreen(),
        ),
        GoRoute(
          path: '/recruiter/pipeline',
          builder: (context, state) => const PipelineScreen(),
        ),
        GoRoute(
          path: '/recruiter/fair_hiring',
          builder: (context, state) => const FairHiringScreen(),
        ),
        GoRoute(
          path: '/recruiter/feedback',
          builder: (context, state) => const FeedbackScreen(),
        ),
      ],
    ),
  ],
);
