import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/network/api_client.dart';

class StudentDashboardScreen extends ConsumerStatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  ConsumerState<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends ConsumerState<StudentDashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _dashboardData;
  Map<String, dynamic>? _readinessData;

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    try {
      final responses = await Future.wait([
        ApiClient.instance.get('/api/student/dashboard'),
        ApiClient.instance.get('/api/student/readiness?targetRole=Software%20Engineer'),
      ]);
      setState(() {
        _dashboardData = responses[0].data;
        _readinessData = responses[1].data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _dashboardData = null; // No mock data
        _readinessData = null; // No mock data
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
      return const Center(child: CircularProgressIndicator(color: NeuTheme.electric));
    }

    final readinessScores = _readinessData?['readiness'] ?? {};
    final techScore = readinessScores['technical'] ?? 0;
    final softScore = readinessScores['softSkills'] ?? 0;
    final aptScore = readinessScores['aptitude'] ?? 0;
    
    final assessments = _dashboardData?['upcomingAssessments'] as List<dynamic>? ?? [];
    final pendingAssessmentsCount = assessments.length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Welcome, ${user['name'] ?? 'Student'}',
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: NeuTheme.ink,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 24),
          
          NeuCard(
            backgroundColor: NeuTheme.acid,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Readiness Radar (Software Engineer)',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: NeuTheme.ink,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 200,
                  child: RadarChart(
                    RadarChartData(
                      dataSets: [
                        RadarDataSet(
                          fillColor: NeuTheme.electric.withOpacity(0.3),
                          borderColor: NeuTheme.electric,
                          entryRadius: 4,
                          dataEntries: [
                            RadarEntry(value: techScore.toDouble()),
                            RadarEntry(value: softScore.toDouble()),
                            RadarEntry(value: aptScore.toDouble()),
                          ],
                          borderWidth: NeuTheme.borderWidth,
                        ),
                      ],
                      radarBackgroundColor: Colors.transparent,
                      borderData: FlBorderData(show: false),
                      radarBorderData: const BorderSide(color: NeuTheme.ink, width: 2),
                      getTitle: (index, angle) {
                        switch (index) {
                          case 0:
                            return const RadarChartTitle(text: 'Technical', angle: 0);
                          case 1:
                            return const RadarChartTitle(text: 'Soft Skills', angle: 0);
                          case 2:
                            return const RadarChartTitle(text: 'Aptitude', angle: 0);
                          default:
                            return const RadarChartTitle(text: '');
                        }
                      },
                      tickCount: 1,
                      ticksTextStyle: const TextStyle(color: Colors.transparent),
                      tickBorderData: const BorderSide(color: NeuTheme.ink),
                      gridBorderData: const BorderSide(color: NeuTheme.ink, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildGauge('Tech', techScore, NeuTheme.cyan),
                    _buildGauge('Soft', softScore, NeuTheme.hotpink),
                    _buildGauge('Apt', aptScore, NeuTheme.amber),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Action Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildActionCard(Icons.trending_up, 'Learning Path', NeuTheme.electric, Colors.white, () => context.push('/student/learning-path')),
              _buildActionCard(Icons.library_books, 'Study Hub', NeuTheme.hotpink, Colors.white, () => context.push('/student/study-hub')),
              _buildActionCard(Icons.quiz, 'Assessments ($pendingAssessmentsCount)', NeuTheme.mint, NeuTheme.ink, () => context.push('/student/assessments')),
              _buildActionCard(Icons.work, 'Opportunities', NeuTheme.amber, NeuTheme.ink, () => context.push('/student/opportunities')),
              _buildActionCard(Icons.person, 'Academic Profile', NeuTheme.sky, NeuTheme.ink, () => context.push('/student/profile')),
              _buildActionCard(Icons.assignment, 'Assignments', NeuTheme.hotpink, Colors.white, () => context.push('/student/assignments')),
              _buildActionCard(Icons.leaderboard, 'Leaderboard', NeuTheme.coral, Colors.white, () => context.push('/student/leaderboard')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGauge(String label, num value, Color color) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 60,
              height: 60,
              child: CircularProgressIndicator(
                value: value / 100,
                backgroundColor: NeuTheme.ink.withOpacity(0.1),
                color: color,
                strokeWidth: 8,
              ),
            ),
            Text(
              '$value%',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        )
      ],
    );
  }

  Widget _buildActionCard(IconData icon, String title, Color bgColor, Color textColor, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
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
