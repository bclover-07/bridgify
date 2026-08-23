import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/theme/neu_chart.dart';
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

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    try {
      final response = await ApiClient.instance.get('/api/student/dashboard');
      setState(() {
        _dashboardData = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _dashboardData = null;
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
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: NeuTheme.electric));
    }

    final data = _dashboardData ?? {};
    final profile = data['profile'] ?? {};
    final stats = data['stats'] ?? {};
    final notifications = data['notifications'] as List<dynamic>? ?? [];
    final segSummary = data['segSummary'] as List<dynamic>? ?? [];
    final upcomingAssessments = data['upcomingAssessments'] as List<dynamic>? ?? [];
    final recentSubmissions = data['recentSubmissions'] as List<dynamic>? ?? [];

    final firstName = (profile['name'] ?? 'Student').toString().split(' ').first;

    final radarData = segSummary.take(6).map((s) {
      return {
        'name': (s['skillLabel'] ?? 'Skill').toString(),
        'score': (s['confidenceScore'] ?? 0),
      };
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: PageTransition(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Welcome Banner
            StaggerItem(
              index: 0,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hey, $firstName! 🎓',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: NeuTheme.ink,
                            letterSpacing: -1,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${profile['branch'] ?? 'Unknown'} · Year ${profile['year'] ?? '-'} · CGPA: ${profile['cgpa'] ?? '-'}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (notifications.isNotEmpty)
                    NeuBadge(
                      text: '${notifications.length} new',
                      variant: 'warning',
                      icon: const Icon(Icons.notifications, size: 14, color: NeuTheme.ink),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // KPI Cards
            StaggerItem(
              index: 1,
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.2,
                children: [
                  _buildStatCard(
                    'Total Skills',
                    (stats['totalSkills'] ?? 0).toString(),
                    Icons.track_changes,
                    const Color(0xFF4B3AFF),
                    () => context.push('/student/profile'),
                  ),
                  _buildStatCard(
                    'Evidence Points',
                    (stats['totalEvidence'] ?? 0).toString(),
                    Icons.emoji_events,
                    const Color(0xFF2FE3A3),
                    () => context.push('/student/profile'),
                  ),
                  _buildStatCard(
                    'Avg Confidence',
                    '${stats['avgConfidence'] ?? 0}%',
                    Icons.trending_up,
                    const Color(0xFFFF3D9A),
                    () => context.push('/student/benchmarks'),
                  ),
                  _buildStatCard(
                    'Assessments',
                    upcomingAssessments.length.toString(),
                    Icons.assignment,
                    const Color(0xFFFFB020),
                    () => context.push('/student/assignments'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Skill Radar
            StaggerItem(
              index: 2,
              child: NeuCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '🧠 Skill Radar',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        GestureDetector(
                          onTap: () => context.push('/student/profile'),
                          child: const NeuBadge(text: 'View SEG →', variant: 'info'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    if (radarData.length >= 3)
                      NeuRadarChart(data: radarData)
                    else if (segSummary.isNotEmpty)
                      ...segSummary.take(6).map((s) => _buildSkillBar(s['skillLabel'], s['confidenceScore']))
                    else
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Text('No skills verified yet', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                        ),
                      )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Upcoming Assessments
            StaggerItem(
              index: 3,
              child: NeuCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '📋 Upcoming',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        GestureDetector(
                          onTap: () => context.push('/student/assignments'),
                          child: const NeuBadge(text: 'View All →', variant: 'default'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (upcomingAssessments.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 24.0),
                          child: Text('No upcoming assessments', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                        ),
                      )
                    else
                      ...upcomingAssessments.take(5).map((a) {
                        return GestureDetector(
                          onTap: () => context.push('/student/assignments'),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: NeuTheme.paper,
                              border: Border.all(color: NeuTheme.ink, width: 3),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: const [
                                BoxShadow(color: NeuTheme.ink, offset: Offset(4, 4))
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        a['title'] ?? 'Assessment',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        a['topic'] ?? 'Topic',
                                        style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '${a['totalMarks'] ?? 0} marks',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
                                    ),
                                    if (a['dueDate'] != null)
                                      Text(
                                        DateFormat('MM/dd/yyyy').format(DateTime.parse(a['dueDate'])),
                                        style: const TextStyle(fontSize: 10, color: Colors.grey),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      })
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Recent Submissions
            if (recentSubmissions.isNotEmpty)
              StaggerItem(
                index: 4,
                child: NeuCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        '📝 Recent Submissions',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      ...recentSubmissions.map((s) {
                        final status = s['gradingStatus'] ?? 'pending';
                        String variant = 'warning';
                        if (status == 'final') variant = 'success';
                        if (status == 'auto_graded') variant = 'info';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: NeuTheme.paper,
                            border: Border.all(color: NeuTheme.ink, width: 3),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      s['assessmentId']?['title'] ?? 'Assessment',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      s['assessmentId']?['topic'] ?? 'Topic',
                                      style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  if (s['percentage'] != null)
                                    Padding(
                                      padding: const EdgeInsets.only(right: 8.0),
                                      child: Text(
                                        '${s['percentage']}%',
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                                      ),
                                    ),
                                  NeuBadge(
                                    text: status.toString().replaceAll('_', ' ').toUpperCase(),
                                    variant: variant,
                                  ),
                                ],
                              )
                            ],
                          ),
                        );
                      })
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color bgColor, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: NeuCard(
        animateHover: true,
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: NeuTheme.ink, width: 2),
                boxShadow: const [
                  BoxShadow(color: NeuTheme.ink, offset: Offset(2, 2))
                ],
              ),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            const Spacer(),
            Text(
              value,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, height: 1.0),
            ),
            const SizedBox(height: 4),
            Text(
              label.toUpperCase(),
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkillBar(String label, num score) {
    Color color = NeuTheme.coral;
    if (score > 40) color = NeuTheme.amber;
    if (score > 70) color = NeuTheme.mint;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              Text('$score%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 6),
          Container(
            height: 12,
            decoration: BoxDecoration(
              color: NeuTheme.paper,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: NeuTheme.ink, width: 2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: score / 100,
              child: Container(
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(4),
                  border: const Border(right: BorderSide(color: NeuTheme.ink, width: 2)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
