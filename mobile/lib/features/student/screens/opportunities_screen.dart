import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class OpportunitiesScreen extends ConsumerStatefulWidget {
  const OpportunitiesScreen({super.key});

  @override
  ConsumerState<OpportunitiesScreen> createState() => _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends ConsumerState<OpportunitiesScreen> {
  bool isLoading = true;
  List<Map<String, dynamic>> jobs = [];

  @override
  void initState() {
    super.initState();
    _fetchJobs();
  }

  Future<void> _fetchJobs() async {
    try {
      final response = await ApiClient.instance.get('/api/student/opportunities');
      final drives = response.data['opportunities'] as List<dynamic>? ?? [];
      
      final List<Map<String, dynamic>> parsedJobs = [];
      for (var drive in drives) {
        final roles = drive['roles'] as List<dynamic>? ?? [];
        for (var role in roles) {
          parsedJobs.add({
            "id": role['_id'] ?? drive['_id'],
            "driveId": drive['_id'],
            "company": drive['company'] ?? 'Unknown',
            "role": role['title'] ?? 'Role',
            "package": role['package'] ?? '',
            "type": drive['status'] == 'active' ? 'Active' : 'Upcoming',
          });
        }
      }

      setState(() {
        jobs = parsedJobs;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        jobs = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load opportunities: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Opportunities'),
        backgroundColor: NeuTheme.amber,
        foregroundColor: NeuTheme.ink,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.amber))
        : jobs.isEmpty
          ? const Center(child: Text("No upcoming opportunities found."))
              : PageTransition(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.8,
                    ),
                    itemCount: jobs.length,
                    itemBuilder: (context, index) {
                      final job = jobs[index];
                      return StaggerItem(
                        index: index,
                        child: _buildJobCard(job),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildJobCard(Map<String, dynamic> job) {
    return NeuCard(
      backgroundColor: NeuTheme.paper,
      animateHover: true,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: NeuTheme.electric,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: NeuTheme.ink, width: 2),
                ),
                child: Text(
                  job['type'],
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
            ],
          ),
          const Spacer(),
          Text(
            job['company'],
            style: TextStyle(fontSize: 12, color: Colors.grey[700], fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            job['role'],
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, height: 1.1),
          ),
          if (job['package'].toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(job['package'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NeuTheme.electric)),
            ),
          const Spacer(),
          NeuButton(
            text: 'Apply',
            backgroundColor: NeuTheme.acid,
            onPressed: () async {
              try {
                await ApiClient.instance.post('/api/student/opportunities/${job['driveId']}/apply');
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application submitted successfully!')));
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to apply: $e')));
                }
              }
            },
          )
        ],
      ),
    );
  }
}
