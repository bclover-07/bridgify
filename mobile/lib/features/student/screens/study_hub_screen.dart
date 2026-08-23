import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class StudyHubScreen extends ConsumerStatefulWidget {
  const StudyHubScreen({super.key});

  @override
  ConsumerState<StudyHubScreen> createState() => _StudyHubScreenState();
}

class _StudyHubScreenState extends ConsumerState<StudyHubScreen> {
  final TextEditingController _roleController = TextEditingController();
  bool isLoading = false;
  Map<String, dynamic>? generatedPlan;

  Future<void> _generatePlan() async {
    if (_roleController.text.trim().isEmpty) return;
    setState(() => isLoading = true);
    
    try {
      final response = await ApiClient.instance.post('/api/student/study-plan/generate', data: {
        "targetRole": _roleController.text.trim()
      });
      setState(() {
        generatedPlan = response.data['plan'] as Map<String, dynamic>?;
        isLoading = false;
      });
      if (mounted && response.data['message'] != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response.data['message'])));
      }
    } catch (e) {
      setState(() {
        generatedPlan = null; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to generate plan: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Study Hub'),
        backgroundColor: NeuTheme.hotpink,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                children: [
                  const Icon(Icons.menu_book, size: 64, color: NeuTheme.ink),
                  const SizedBox(height: 16),
                  const Text('AI Study Plan Generator', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _roleController,
                    hintText: 'Target Role (e.g., Data Scientist)',
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: isLoading ? 'Generating via Agent...' : 'Generate Plan',
                    backgroundColor: NeuTheme.hotpink,
                    textColor: Colors.white,
                    onPressed: isLoading ? null : _generatePlan,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (generatedPlan != null)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Your AI Study Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Expanded(
                      child: ListView.builder(
                        itemCount: (generatedPlan!['weeks'] as List<dynamic>? ?? []).length,
                        itemBuilder: (context, index) {
                          final week = generatedPlan!['weeks'][index];
                          final skills = (week['focusSkills'] as List<dynamic>? ?? []).join(', ');
                          final milestone = week['milestone'] ?? '';
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: NeuCard(
                              backgroundColor: Colors.white,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Week ${week['weekNumber']}: $skills', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: NeuTheme.hotpink)),
                                  const SizedBox(height: 8),
                                  Text(milestone, style: const TextStyle(fontStyle: FontStyle.italic)),
                                  const SizedBox(height: 8),
                                  ...(week['activities'] as List<dynamic>? ?? []).map((a) {
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.check_circle_outline, size: 16, color: NeuTheme.ink),
                                          const SizedBox(width: 8),
                                          Expanded(child: Text('${a['title']} (${a['hours']}h - ${a['type']})', style: const TextStyle(fontSize: 12))),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
