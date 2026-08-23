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

  @override
  void initState() {
    super.initState();
    _fetchPath();
  }

  Future<void> _fetchPath() async {
    try {
      final response = await ApiClient.instance.get('/api/student/learning-path');
      setState(() {
        nodes = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        nodes = [
          {"id": 1, "title": "Data Structures", "status": "completed"},
          {"id": 2, "title": "Algorithms", "status": "in_progress"},
          {"id": 3, "title": "System Design", "status": "locked"},
          {"id": 4, "title": "Cloud Computing", "status": "locked"},
        ];
        isLoading = false;
      });
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
        : ListView.builder(
            padding: const EdgeInsets.all(24),
            itemCount: nodes.length,
            itemBuilder: (context, index) {
              final node = nodes[index];
              return _buildPathNode(node, index == nodes.length - 1);
            },
          ),
    );
  }

  Widget _buildPathNode(Map<String, dynamic> node, bool isLast) {
    final status = node['status'];
    Color bgColor = NeuTheme.paper;
    Color iconColor = Colors.grey;
    IconData icon = Icons.lock;

    if (status == 'completed') {
      bgColor = NeuTheme.mint;
      iconColor = NeuTheme.ink;
      icon = Icons.check_circle;
    } else if (status == 'in_progress') {
      bgColor = NeuTheme.acid;
      iconColor = NeuTheme.ink;
      icon = Icons.play_circle_filled;
    }

    return Column(
      children: [
        NeuCard(
          backgroundColor: bgColor,
          animateHover: status != 'locked',
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(icon, color: iconColor, size: 32),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  node['title'],
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: status == 'locked' ? Colors.grey[700] : NeuTheme.ink,
                  ),
                ),
              ),
              if (status == 'in_progress')
                NeuButton(
                  text: 'Continue',
                  color: NeuTheme.electric,
                  onPressed: () {},
                )
            ],
          ),
        ),
        if (!isLast)
          Container(
            width: 4,
            height: 40,
            color: NeuTheme.ink,
          ),
      ],
    );
  }
}
