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
  String? generatedPlan;

  Future<void> _generatePlan() async {
    if (_roleController.text.trim().isEmpty) return;
    setState(() => isLoading = true);
    
    try {
      final response = await ApiClient.instance.post('/api/student/study-plan/generate', data: {
        "targetRole": _roleController.text.trim()
      });
      setState(() {
        generatedPlan = response.data['plan'];
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
                    color: NeuTheme.hotpink,
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
                    const Text('Your Study Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Expanded(
                      child: NeuCard(
                        backgroundColor: Colors.white,
                        child: SingleChildScrollView(
                          child: Text(
                            generatedPlan!,
                            style: const TextStyle(fontSize: 14, height: 1.5, color: NeuTheme.ink),
                          ),
                        ),
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
