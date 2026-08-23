import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class PsGeneratorScreen extends ConsumerStatefulWidget {
  const PsGeneratorScreen({super.key});

  @override
  ConsumerState<PsGeneratorScreen> createState() => _PsGeneratorScreenState();
}

class _PsGeneratorScreenState extends ConsumerState<PsGeneratorScreen> {
  final TextEditingController _roleController = TextEditingController();
  final TextEditingController _skillsController = TextEditingController();
  final TextEditingController _difficultyController = TextEditingController();
  bool _isGenerating = false;
  Map<String, dynamic>? _generatedStatement;

  Future<void> _generatePS() async {
    if (_roleController.text.trim().isEmpty) return;
    setState(() => _isGenerating = true);
    
    try {
      final rawIdea = "Role: ${_roleController.text.trim()}, Skills: ${_skillsController.text.trim()}, Difficulty: ${_difficultyController.text.trim()}";
      final response = await ApiClient.instance.post('/api/recruiter/ps/generate', data: {
        "rawIdea": rawIdea,
      });
      setState(() {
        _generatedStatement = response.data['problemStatement'];
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response.data['message'] ?? 'Generated successfully')));
      }
    } catch (e) {
      setState(() {
        _generatedStatement = null; // No mock data
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Generation failed: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _publishPS() async {
    if (_generatedStatement == null || _generatedStatement!['_id'] == null) return;
    try {
      final id = _generatedStatement!['_id'];
      await ApiClient.instance.post('/api/recruiter/ps/$id/publish');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Problem statement published')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Publish failed: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI PS Generator'),
        backgroundColor: NeuTheme.violet,
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
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Configure Assessment', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _roleController,
                    hintText: 'Target Role (e.g. Backend Developer)',
                  ),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _skillsController,
                    hintText: 'Key Skills (e.g. Node.js, Redis, SQL)',
                  ),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _difficultyController,
                    hintText: 'Difficulty (e.g. Medium/Hard)',
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Generating via Agent...' : 'Generate Problem Statement',
                    color: NeuTheme.violet,
                    textColor: Colors.white,
                    onPressed: _isGenerating ? null : _generatePS,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (_generatedStatement != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Generated Statement', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  NeuButton(
                    text: 'Publish to Candidates',
                    color: NeuTheme.mint,
                    onPressed: _publishPS,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: NeuCard(
                  backgroundColor: Colors.white,
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _generatedStatement!['title'] ?? 'Untitled PS',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _generatedStatement!['description'] ?? 'No description generated.',
                          style: const TextStyle(fontSize: 14, height: 1.5),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
