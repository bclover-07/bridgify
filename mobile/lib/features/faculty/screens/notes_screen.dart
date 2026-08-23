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
  
  // OCR Form Controllers
  final TextEditingController _ocrTitleController = TextEditingController();
  final TextEditingController _ocrTextController = TextEditingController();

  bool _isGenerating = false;
  Map<String, dynamic>? _generatedResource;
  List<dynamic>? _generatedTopics;

  Future<void> _generateOCR() async {
    if (_ocrTitleController.text.trim().isEmpty || _ocrTextController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter title and OCR text/notes')));
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

      final response = await ApiClient.instance.post('/api/faculty/notes/ocr-generate', data: {
        "courseId": courseId,
        "title": _ocrTitleController.text.trim(),
        "noteContent": _ocrTextController.text.trim(),
      });

      setState(() {
        _generatedResource = response.data['resource'] ?? response.data;
        _generatedTopics = response.data['topics'];
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response.data['message'] ?? 'Extracted successfully')));
      }
    } catch (e) {
      setState(() {
        _generatedResource = null;
        _generatedTopics = null;
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to extract notes: ${e.toString()}')),
        );
      }
    }
  }

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
        _generatedTopics = null;
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response.data['message'] ?? 'Generated successfully')));
      }
    } catch (e) {
      setState(() {
        _generatedResource = null;
        _generatedTopics = null;
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
            const SizedBox(height: 16),
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Extract Lecture Topics (OCR/Text)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _ocrTitleController,
                    hintText: 'OCR Notes Title',
                  ),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _ocrTextController,
                    hintText: 'Paste lecture text or OCR data here...',
                    maxLines: 4,
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Extracting...' : 'Extract & Build Notes',
                    backgroundColor: NeuTheme.amber,
                    onPressed: _isGenerating ? null : _generateOCR,
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
                    Text('Title: ${_generatedResource!['title'] ?? 'Notes'}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                      ),
                      child: Text(
                        _generatedResource!['content'] ?? _generatedResource!['summary'] ?? _generatedResource!['contentMarkdown'] ?? 'No content generated.',
                        style: const TextStyle(fontSize: 14),
                        maxLines: 15,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (_generatedTopics != null) ...[
                      const SizedBox(height: 16),
                      const Text('Extracted Topics:', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _generatedTopics!.map<Widget>((t) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: NeuTheme.ink),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('📌 $t', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        )).toList(),
                      ),
                    ]
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
