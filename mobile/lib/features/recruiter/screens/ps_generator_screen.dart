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
  String? _generatedStatement;

  Future<void> _generatePS() async {
    if (_roleController.text.trim().isEmpty) return;
    setState(() => _isGenerating = true);
    
    try {
      final response = await ApiClient.instance.post('/api/recruiter/ps-generator', data: {
        "role": _roleController.text,
        "skills": _skillsController.text,
        "difficulty": _difficultyController.text,
      });
      setState(() {
        _generatedStatement = response.data['statement'];
        _isGenerating = false;
      });
    } catch (e) {
      setState(() {
        _generatedStatement = "Role: ${_roleController.text}\n\n"
            "Problem Statement:\n"
            "Design and implement a scalable microservice architecture for an e-commerce checkout flow. "
            "Ensure the system handles high throughput and guarantees ACID properties during transactions.\n\n"
            "Evaluation Criteria:\n"
            "- Code Quality and Modularity\n"
            "- Performance under load\n"
            "- Correctness of business logic";
        _isGenerating = false;
      });
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
                    text: _isGenerating ? 'Generating...' : 'Generate Problem Statement',
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
                    onPressed: () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: NeuCard(
                  backgroundColor: Colors.white,
                  child: SingleChildScrollView(
                    child: Text(
                      _generatedStatement!,
                      style: const TextStyle(fontSize: 14, height: 1.5),
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
