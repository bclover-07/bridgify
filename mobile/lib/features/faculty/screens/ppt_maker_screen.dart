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

      final response = await ApiClient.instance.post('/api/faculty/generate-ppt', data: {
        "courseId": courseId,
        "topic": _topicController.text.trim(),
      });

      setState(() {
        _generatedPPT = response.data['resource'];
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
                    color: NeuTheme.hotpink,
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
                  NeuButton(
                    text: 'Download .pptx',
                    color: NeuTheme.mint,
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Download not implemented yet')));
                    },
                  )
                ],
              ),
              const SizedBox(height: 16),
              AspectRatio(
                aspectRatio: 16 / 9,
                child: NeuCard(
                  backgroundColor: Colors.white,
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          _generatedPPT!['title'] ?? 'Generated PPT',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _generatedPPT!['content'] ?? 'No content generated.',
                          style: TextStyle(fontSize: 14, color: Colors.grey[800]),
                          textAlign: TextAlign.center,
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
