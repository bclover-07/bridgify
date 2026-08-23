import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class LectureBridgeScreen extends ConsumerStatefulWidget {
  const LectureBridgeScreen({super.key});

  @override
  ConsumerState<LectureBridgeScreen> createState() => _LectureBridgeScreenState();
}

class _LectureBridgeScreenState extends ConsumerState<LectureBridgeScreen> {
  final TextEditingController _topicController = TextEditingController();
  final TextEditingController _subtopicsController = TextEditingController();
  bool _isGenerating = false;
  List<dynamic> _microLessons = [];

  Future<void> _generateLessons() async {
    if (_topicController.text.trim().isEmpty) return;
    setState(() => _isGenerating = true);
    
    try {
      final response = await ApiClient.instance.post('/api/faculty/bridge', data: {
        "topic": _topicController.text,
        "subtopics": _subtopicsController.text,
      });
      setState(() {
        _microLessons = response.data['data'] ?? [];
        _isGenerating = false;
      });
    } catch (e) {
      setState(() {
        _microLessons = [
          {"id": 1, "title": "Intro to ${_topicController.text}", "type": "Video", "status": "Ready"},
          {"id": 2, "title": "Core Concepts", "type": "Article", "status": "Ready"},
          {"id": 3, "title": "Quick Quiz", "type": "Quiz", "status": "Ready"},
        ];
        _isGenerating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lecture Bridge'),
        backgroundColor: NeuTheme.electric,
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
                  const Text('Create Micro-Learning Module', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _topicController,
                    hintText: 'Main Topic (e.g. Advanced AI)',
                  ),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _subtopicsController,
                    hintText: 'Subtopics (comma separated)',
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Building Bridge...' : 'Generate Micro-Lessons',
                    color: NeuTheme.electric,
                    textColor: Colors.white,
                    onPressed: _isGenerating ? null : _generateLessons,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (_microLessons.isNotEmpty) ...[
              const Text('Generated Module', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  itemCount: _microLessons.length,
                  itemBuilder: (context, index) {
                    final lesson = _microLessons[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: NeuCard(
                        backgroundColor: Colors.white,
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: NeuTheme.electric,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: NeuTheme.ink, width: 2),
                              ),
                              child: Center(
                                child: Icon(
                                  lesson['type'] == 'Video' ? Icons.play_arrow : (lesson['type'] == 'Quiz' ? Icons.quiz : Icons.article),
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(lesson['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Text(lesson['type'], style: TextStyle(color: Colors.grey[700], fontSize: 14)),
                                ],
                              ),
                            ),
                            NeuButton(
                              text: 'Publish',
                              color: NeuTheme.mint,
                              onPressed: () {},
                            )
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
