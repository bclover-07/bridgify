import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class FacultyAssessmentsScreen extends ConsumerStatefulWidget {
  const FacultyAssessmentsScreen({super.key});

  @override
  ConsumerState<FacultyAssessmentsScreen> createState() => _FacultyAssessmentsScreenState();
}

class _FacultyAssessmentsScreenState extends ConsumerState<FacultyAssessmentsScreen> {
  final TextEditingController _topicController = TextEditingController();
  String _difficulty = 'Medium';
  bool _isGenerating = false;
  List<dynamic> _generatedQuestions = [];

  Future<void> _generateQuiz() async {
    if (_topicController.text.trim().isEmpty) return;
    setState(() => _isGenerating = true);
    
    try {
      final response = await ApiClient.instance.post('/api/faculty/assessments/generate', data: {
        "topic": _topicController.text,
        "difficulty": _difficulty,
      });
      setState(() {
        _generatedQuestions = response.data['data'] ?? [];
        _isGenerating = false;
      });
    } catch (e) {
      setState(() {
        _generatedQuestions = [
          {"q": "What is the Time Complexity of QuickSort?", "options": ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"]},
          {"q": "Which data structure uses LIFO?", "options": ["Queue", "Stack", "Tree", "Graph"]}
        ];
        _isGenerating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Quiz Generator'),
        backgroundColor: NeuTheme.lime,
        foregroundColor: NeuTheme.ink,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Generate AI Quiz', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            NeuInput(
              controller: _topicController,
              hintText: 'Enter topic (e.g., Data Structures)',
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                boxShadow: const [BoxShadow(color: NeuTheme.ink, offset: Offset(4, 4))],
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _difficulty,
                  isExpanded: true,
                  items: ['Easy', 'Medium', 'Hard'].map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontWeight: FontWeight.bold)))).toList(),
                  onChanged: (v) => setState(() => _difficulty = v!),
                ),
              ),
            ),
            const SizedBox(height: 24),
            NeuButton(
              text: _isGenerating ? 'Generating...' : 'Generate Quiz',
              color: NeuTheme.lime,
              onPressed: _isGenerating ? null : _generateQuiz,
            ),
            const SizedBox(height: 24),
            if (_generatedQuestions.isNotEmpty) ...[
              const Divider(color: NeuTheme.ink, thickness: NeuTheme.borderWidth),
              const SizedBox(height: 16),
              const Text('Generated Questions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  itemCount: _generatedQuestions.length,
                  itemBuilder: (context, index) {
                    final q = _generatedQuestions[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: NeuCard(
                        backgroundColor: NeuTheme.paper,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text('${index + 1}. ${q['q']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 8),
                            ...q['options'].map<Widget>((opt) => Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text('- $opt'),
                            )).toList(),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
