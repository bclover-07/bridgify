import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _dashboardData;

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    try {
      final response = await ApiClient.instance.get('/api/admin/dashboard');
      setState(() {
        _dashboardData = response.data;
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
      return const Center(child: CircularProgressIndicator(color: NeuTheme.hotpink));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Admin Portal\n${user['name'] ?? 'Administrator'}',
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: NeuTheme.ink,
              letterSpacing: -1,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 24),

          // Overview Metrics
          Row(
            children: [
              Expanded(
                child: NeuCard(
                  backgroundColor: NeuTheme.hotpink,
                  child: Column(
                    children: [
                      const Icon(Icons.school, size: 40, color: NeuTheme.ink),
                      const SizedBox(height: 8),
                      Text('${_dashboardData?['stats']?['studentCount'] ?? 0}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                      const Text('Total Students', textAlign: TextAlign.center),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: NeuCard(
                  backgroundColor: NeuTheme.mint,
                  child: Column(
                    children: [
                      const Icon(Icons.work, size: 40, color: NeuTheme.ink),
                      const SizedBox(height: 8),
                      Text('${_dashboardData?['stats']?['assessmentCount'] ?? 0}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: NeuTheme.ink)),
                      const Text('Total Assessments', textAlign: TextAlign.center, style: TextStyle(color: NeuTheme.ink)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Action Grid
          const Text('Management Tools', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildActionCard(context, Icons.people, 'Student Directory', NeuTheme.sky, NeuTheme.ink, '/admin/student_directory'),
              _buildActionCard(context, Icons.view_kanban, 'Placement CC', NeuTheme.hotpink, Colors.white, '/admin/placement_cc'),
              _buildActionCard(context, Icons.insert_chart, 'NAAC Reports', NeuTheme.amber, NeuTheme.ink, '/admin/naac_report'),
              _buildActionCard(context, Icons.account_balance_wallet, 'Skill Ledger', NeuTheme.violet, Colors.white, '/admin/skill_ledger'),
              _buildActionCard(context, Icons.analytics, 'Analytics', NeuTheme.coral, Colors.white, '/admin/analytics'),
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
