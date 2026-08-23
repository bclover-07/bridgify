import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class PPTMakerScreen extends ConsumerStatefulWidget {
  const PPTMakerScreen({super.key});

  @override
  ConsumerState<PPTMakerScreen> createState() => _PPTMakerScreenState();
}

class _PPTMakerScreenState extends ConsumerState<PPTMakerScreen> {
  final TextEditingController _topicController = TextEditingController();
  bool _isGenerating = false;
  Map<String, dynamic>? _generatedPPT;

  Future<void> _generatePPT() async {
    if (_topicController.text.trim().isEmpty) return;
    setState(() => _isGenerating = true);
    
    try {
      final coursesRes = await ApiClient.instance.get('/api/faculty/courses');
      final courses = coursesRes.data['courses'] as List<dynamic>? ?? [];
      
      if (courses.isEmpty) {
        setState(() => _isGenerating = false);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No courses found')));
        return;
      }

      final courseId = courses[0]['_id'];

      final response = await ApiClient.instance.post('/api/faculty/ppt/generate', data: {
        "courseId": courseId,
        "topic": _topicController.text.trim(),
      });

      setState(() {
        _generatedPPT = response.data;
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response.data['message'] ?? 'PPT generated successfully')));
      }
    } catch (e) {
      setState(() {
        _generatedPPT = null; // No mock data
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate PPT: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI PPT Maker'),
        backgroundColor: NeuTheme.hotpink,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Create Presentation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _topicController,
                    hintText: 'Topic (e.g. History of Web)',
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Generating via Agent...' : 'Generate PPT',
                    backgroundColor: NeuTheme.hotpink,
                    onPressed: _isGenerating ? null : _generatePPT,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (_generatedPPT != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Preview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 16),
              AspectRatio(
                aspectRatio: 16 / 9,
                child: NeuCard(
                  backgroundColor: Colors.white,
                  child: PageView.builder(
                    itemCount: (_generatedPPT!['slides'] as List<dynamic>? ?? []).length,
                    itemBuilder: (context, index) {
                      final slide = _generatedPPT!['slides'][index];
                      return Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              slide['title'] ?? 'Slide',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: NeuTheme.hotpink),
                            ),
                            if (slide['subtitle'] != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 8.0, bottom: 16.0),
                                child: Text(
                                  slide['subtitle'],
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey),
                                ),
                              ),
                            const SizedBox(height: 16),
                            ...(slide['bullets'] as List<dynamic>? ?? []).map((bullet) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('• ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      Expanded(
                                        child: Text(
                                          bullet.toString(),
                                          style: TextStyle(fontSize: 14, color: Colors.grey[800]),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                          ],
                        ),
                      );
                    },
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
