import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class FacultyDashboardScreen extends ConsumerStatefulWidget {
  const FacultyDashboardScreen({super.key});

  @override
  ConsumerState<FacultyDashboardScreen> createState() => _FacultyDashboardScreenState();
}

class _FacultyDashboardScreenState extends ConsumerState<FacultyDashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _dashboardData;

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    try {
      final response = await ApiClient.instance.get('/api/faculty/dashboard');
      setState(() {
        _dashboardData = response.data['stats'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _dashboardData = null; // No mock data
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load dashboard: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user ?? {};

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: NeuTheme.sky));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Welcome, Prof. ${user['name'] ?? 'Faculty'}',
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: NeuTheme.ink,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 24),

          // Overview Metrics
          Row(
            children: [
              Expanded(
                child: NeuCard(
                  backgroundColor: NeuTheme.sky,
                  child: Column(
                    children: [
                      const Icon(Icons.people, size: 40, color: NeuTheme.ink),
                      const SizedBox(height: 8),
                      Text('${_dashboardData?['totalStudents'] ?? 0}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                      const Text('Total Students'),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: NeuCard(
                  backgroundColor: NeuTheme.coral,
                  child: Column(
                    children: [
                      const Icon(Icons.warning, size: 40, color: Colors.white),
                      const SizedBox(height: 8),
                      Text('${_dashboardData?['totalAssessments'] ?? 0}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
                      const Text('Total Assessments', style: TextStyle(color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Action Grid
          const Text('Quick Actions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildActionCard(context, Icons.radar, 'Dropout Radar', NeuTheme.coral, Colors.white, '/faculty/dropout_radar'),
              _buildActionCard(context, Icons.map, 'Cohort Heatmap', NeuTheme.violet, Colors.white, '/faculty/cohort_heatmap'),
              _buildActionCard(context, Icons.architecture, 'Lecture Bridge', NeuTheme.electric, Colors.white, '/faculty/lecture_bridge'),
              _buildActionCard(context, Icons.group, 'Mentorship', NeuTheme.acid, NeuTheme.ink, '/faculty/mentorship'),
              _buildActionCard(context, Icons.quiz, 'Assessments', NeuTheme.lime, NeuTheme.ink, '/faculty/assessments'),
              _buildActionCard(context, Icons.feed, 'Learning Feed', NeuTheme.sky, NeuTheme.ink, '/faculty/learning_feed'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, IconData icon, String title, Color bgColor, Color textColor, String route) {
    return GestureDetector(
      onTap: () => context.push(route),
      child: NeuCard(
        backgroundColor: bgColor,
        animateHover: true,
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: textColor),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
