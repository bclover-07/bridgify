import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';

class StudentLayout extends StatefulWidget {
  final Widget child;
  const StudentLayout({super.key, required this.child});

  @override
  State<StudentLayout> createState() => _StudentLayoutState();
}

class _StudentLayoutState extends State<StudentLayout> {
  int _currentIndex = 0;

  final List<String> _routes = [
    '/student',
    '/student/readiness',
    '/student/study-hub',
    '/student/assessments',
  ];

  void _onTap(int index) {
    if (index == _currentIndex) return;
    setState(() => _currentIndex = index);
    context.go(_routes[index]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('student'.tr().toUpperCase()),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Colors.white),
            onPressed: () {},
          )
        ],
      ),
      drawer: Drawer(
        backgroundColor: NeuTheme.paper,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                color: NeuTheme.electric,
                border: Border(bottom: BorderSide(color: NeuTheme.ink, width: NeuTheme.borderWidth)),
              ),
              child: const Text(
                'Student Navigation',
                style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
              ),
            ),
            _buildDrawerItem(Icons.dashboard, 'Dashboard', '/student'),
            _buildDrawerItem(Icons.person, 'Academic Profile', '/student/profile'),
            _buildDrawerItem(Icons.account_balance_wallet, 'Skill Wallet', '/student/wallet'),
            _buildDrawerItem(Icons.trending_up, 'Readiness Simulator', '/student/readiness'),
            _buildDrawerItem(Icons.timeline, 'AI Learning Path', '/student/learning-path'),
            _buildDrawerItem(Icons.assignment, 'Assignments', '/student/assignments'),
            _buildDrawerItem(Icons.quiz, 'Assessments', '/student/assessments'),
            _buildDrawerItem(Icons.library_books, 'Study Hub', '/student/study-hub'),
            _buildDrawerItem(Icons.psychology, 'Soft Skills & Debate', '/student/soft-skills'),
            _buildDrawerItem(Icons.work, 'Opportunities', '/student/opportunities'),
            _buildDrawerItem(Icons.analytics, 'Benchmarks', '/student/benchmarks'),
            _buildDrawerItem(Icons.leaderboard, 'Leaderboard', '/student/leaderboard'),
          ],
        ),
      ),
      body: widget.child,
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, String route) {
    return ListTile(
      leading: Icon(icon, color: NeuTheme.ink),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.ink)),
      onTap: () {
        context.pop(); // Close drawer
        context.go(route);
      },
    );
  }
}
