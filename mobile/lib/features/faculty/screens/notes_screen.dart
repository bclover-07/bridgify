import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class NotesScreen extends ConsumerStatefulWidget {
  const NotesScreen({super.key});

  @override
  ConsumerState<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends ConsumerState<NotesScreen> {
  final TextEditingController _urlController = TextEditingController();
  final TextEditingController _titleController = TextEditingController();
  bool _isGenerating = false;
  Map<String, dynamic>? _generatedResource;

  Future<void> _generateNotes() async {
    if (_urlController.text.trim().isEmpty || _titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter title and URL')));
      return;
    }
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

      final response = await ApiClient.instance.post('/api/faculty/notes/generate', data: {
        "courseId": courseId,
        "sourceType": "youtube",
        "sourceUrl": _urlController.text.trim(),
        "title": _titleController.text.trim(),
      });

      setState(() {
        _generatedResource = response.data['resource'];
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response.data['message'] ?? 'Generated successfully')));
      }
    } catch (e) {
      setState(() {
        _generatedResource = null;
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate notes: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Notes Generator'),
        backgroundColor: NeuTheme.cyan,
        foregroundColor: NeuTheme.ink,
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
                  const Text('Generate from YouTube URL', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _titleController,
                    hintText: 'Notes Title (e.g. Intro to Data Structures)',
                  ),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _urlController,
                    hintText: 'https://youtube.com/watch?v=...',
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Analyzing Content...' : 'Generate Notes',
                    backgroundColor: NeuTheme.cyan,
                    onPressed: _isGenerating ? null : _generateNotes,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            if (_generatedResource != null)
              NeuCard(
                backgroundColor: NeuTheme.mint,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.check_circle, color: NeuTheme.ink),
                        SizedBox(width: 8),
                        Text('Generated Successfully!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text('Title: ${_generatedResource!['title']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                      ),
                      child: Text(
                        _generatedResource!['content'] ?? 'No content generated.',
                        style: const TextStyle(fontSize: 14),
                        maxLines: 10,
                        overflow: TextOverflow.ellipsis,
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
