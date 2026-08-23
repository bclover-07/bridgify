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
  List<dynamic> jobs = [];

  @override
  void initState() {
    super.initState();
    _fetchJobs();
  }

  Future<void> _fetchJobs() async {
    try {
      final response = await ApiClient.instance.get('/api/student/opportunities');
      setState(() {
        jobs = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        jobs = [
          {"id": 1, "company": "TechCorp", "role": "Frontend Developer", "match": 92, "type": "Full-time"},
          {"id": 2, "company": "DataSys", "role": "Backend Engineer", "match": 85, "type": "Internship"},
          {"id": 3, "company": "Innovate LLC", "role": "UI/UX Designer", "match": 60, "type": "Contract"},
          {"id": 4, "company": "CloudNet", "role": "DevOps Engineer", "match": 75, "type": "Full-time"},
        ];
        isLoading = false;
      });
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
        : GridView.builder(
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
              return _buildJobCard(job);
            },
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: job['match'] >= 80 ? NeuTheme.mint : NeuTheme.amber,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: NeuTheme.ink, width: 2),
                ),
                child: Text(
                  '${job['match']}% Match',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
              )
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
          const Spacer(),
          NeuButton(
            text: 'Apply',
            color: NeuTheme.acid,
            onPressed: () {},
          )
        ],
      ),
    );
  }
}
