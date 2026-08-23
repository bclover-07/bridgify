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
  List<dynamic> nodes = [];
  Map<String, dynamic> aggregate = {};

  @override
  void initState() {
    super.initState();
    _fetchPath();
  }

  Future<void> _fetchPath() async {
    try {
      final response = await ApiClient.instance.get('/api/student/seg');
      setState(() {
        nodes = response.data['nodes'] ?? [];
        aggregate = response.data['aggregate'] ?? {};
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        nodes = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load SEG: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Skill Evidence Graph (SEG)'),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.electric))
        : Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (aggregate.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: NeuCard(
                    backgroundColor: NeuTheme.paper,
                    child: Column(
                      children: [
                        const Text('Overall Readiness Score', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(
                          '${aggregate['totalReadinessScore'] ?? 0}%',
                          style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: NeuTheme.electric),
                        ),
                      ],
                    ),
                  ),
                ),
              Expanded(
                child: nodes.isEmpty
                  ? const Center(child: Text("No skills verified yet."))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: nodes.length,
                      itemBuilder: (context, index) {
                        final node = nodes[index];
                        return _buildPathNode(node, index == nodes.length - 1);
                      },
                    ),
              ),
            ],
          ),
    );
  }

  Widget _buildPathNode(Map<String, dynamic> node, bool isLast) {
    final score = node['proficiencyScore'] ?? 0;
    
    Color bgColor = score >= 80 ? NeuTheme.mint : score >= 50 ? NeuTheme.acid : NeuTheme.paper;
    Color iconColor = score >= 80 ? NeuTheme.ink : Colors.grey[800]!;
    IconData icon = score >= 80 ? Icons.check_circle : Icons.trending_up;

    return Column(
      children: [
        NeuCard(
          backgroundColor: bgColor,
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(icon, color: iconColor, size: 32),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      node['skillName'] ?? 'Skill',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: NeuTheme.ink,
                      ),
                    ),
                    Text(
                      'Category: ${node['skillCategory'] ?? 'Unknown'}',
                      style: TextStyle(color: Colors.grey[800], fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '$score%',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
