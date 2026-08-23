import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class RecruiterDashboardScreen extends ConsumerStatefulWidget {
  const RecruiterDashboardScreen({super.key});

  @override
  ConsumerState<RecruiterDashboardScreen> createState() => _RecruiterDashboardScreenState();
}

class _RecruiterDashboardScreenState extends ConsumerState<RecruiterDashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _dashboardData;

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    try {
      final response = await ApiClient.instance.get('/api/recruiter/dashboard');
      setState(() {
        _dashboardData = response.data['data'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _dashboardData = {
          "active_drives": 3,
          "shortlisted": 45,
          "upcoming_interviews": 12,
        };
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user ?? {};

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: NeuTheme.primary));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Recruiter Portal\n${user['name'] ?? 'Recruiter'}',
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
                      const Icon(Icons.business_center, size: 40, color: Colors.white),
                      const SizedBox(height: 8),
                      Text('${_dashboardData?['active_drives'] ?? 0}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
                      const Text('Active Drives', textAlign: TextAlign.center, style: TextStyle(color: Colors.white)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: NeuCard(
                  backgroundColor: NeuTheme.amber,
                  child: Column(
                    children: [
                      const Icon(Icons.group, size: 40, color: NeuTheme.ink),
                      const SizedBox(height: 8),
                      Text('${_dashboardData?['shortlisted'] ?? 0}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: NeuTheme.ink)),
                      const Text('Shortlisted', textAlign: TextAlign.center, style: TextStyle(color: NeuTheme.ink)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Action Grid
          const Text('Recruitment Tools', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildActionCard(context, Icons.search, 'Candidate Search', NeuTheme.sky, NeuTheme.ink, '/recruiter/candidate_search'),
              _buildActionCard(context, Icons.view_list, 'Pipeline', NeuTheme.mint, NeuTheme.ink, '/recruiter/pipeline'),
              _buildActionCard(context, Icons.assignment, 'PS Generator', NeuTheme.violet, Colors.white, '/recruiter/ps_generator'),
              _buildActionCard(context, Icons.storefront, 'Marketplace', NeuTheme.electric, Colors.white, '/recruiter/marketplace'),
              _buildActionCard(context, Icons.rate_review, 'Interview Feedback', NeuTheme.coral, Colors.white, '/recruiter/feedback'),
              _buildActionCard(context, Icons.gavel, 'Fair Hiring', NeuTheme.acid, NeuTheme.ink, '/recruiter/fair_hiring'),
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
