import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class LearningPathScreen extends ConsumerStatefulWidget {
  const LearningPathScreen({super.key});

  @override
  ConsumerState<LearningPathScreen> createState() => _LearningPathScreenState();
}

class _LearningPathScreenState extends ConsumerState<LearningPathScreen> {
  bool isLoading = true;
  List<dynamic> activeMilestones = [];
  String activePathTitle = '';
  
  @override
  void initState() {
    super.initState();
    _fetchPath();
  }

  Future<void> _fetchPath() async {
    try {
      final response = await ApiClient.instance.post(
        '/api/student/readiness/onboard-path',
        data: { 'targetRole': 'Software Engineer' } // Default for now
      );
      setState(() {
        activeMilestones = response.data['activeMilestones'] ?? [];
        if (activeMilestones.isEmpty && response.data['paths'] != null && response.data['paths'].length > 0) {
           activeMilestones = response.data['paths'][0]['milestones'] ?? [];
           activePathTitle = response.data['paths'][0]['title'] ?? '';
        }
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        activeMilestones = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load learning path: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Learning Path'),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.electric))
        : PageTransition(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                StaggerItem(
                  index: 0,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: NeuCard(
                      backgroundColor: NeuTheme.paper,
                      child: Column(
                        children: [
                          const Text('Current Trajectory', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Text(
                            activePathTitle.isNotEmpty ? activePathTitle : 'Software Engineer Core',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: NeuTheme.electric),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: activeMilestones.isEmpty
                    ? const Center(child: Text("No milestones generated yet."))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: activeMilestones.length,
                        itemBuilder: (context, index) {
                          final milestone = activeMilestones[index];
                          return StaggerItem(
                            index: index + 1,
                            child: _buildMilestoneNode(milestone, index == activeMilestones.length - 1),
                          );
                        },
                      ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildMilestoneNode(Map<String, dynamic> milestone, bool isLast) {
    return Column(
      children: [
        NeuCard(
          backgroundColor: NeuTheme.sky,
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: NeuTheme.electric,
                  border: Border.all(color: NeuTheme.ink, width: 2),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    'W${milestone['week'] ?? ''}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      milestone['title'] ?? 'Milestone',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: NeuTheme.ink,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      milestone['description'] ?? '',
                      style: TextStyle(color: Colors.grey[800], fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (!isLast)
          Container(
            width: 4,
            height: 24,
            color: NeuTheme.ink,
          ),
      ],
    );
  }
}
