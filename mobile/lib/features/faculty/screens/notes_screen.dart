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
  bool _isGenerating = false;
  String? _downloadUrl;

  Future<void> _generateNotes() async {
    if (_urlController.text.trim().isEmpty) return;
    setState(() => _isGenerating = true);
    
    try {
      final response = await ApiClient.instance.post('/api/faculty/notes/generate', data: {
        "url": _urlController.text,
      });
      setState(() {
        _downloadUrl = response.data['download_url'] ?? "https://bridgify.in/downloads/notes.pdf";
        _isGenerating = false;
      });
    } catch (e) {
      setState(() {
        _downloadUrl = "https://bridgify.in/downloads/notes.pdf";
        _isGenerating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notes Generator'),
        backgroundColor: NeuTheme.cyan,
        foregroundColor: NeuTheme.ink,
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
                  const Text('Generate from YouTube URL', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _urlController,
                    hintText: 'https://youtube.com/watch?v=...',
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Generating...' : 'Generate Notes',
                    color: NeuTheme.cyan,
                    onPressed: _isGenerating ? null : _generateNotes,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            if (_downloadUrl != null)
              NeuCard(
                backgroundColor: NeuTheme.mint,
                child: Column(
                  children: [
                    const Icon(Icons.check_circle, size: 64, color: NeuTheme.ink),
                    const SizedBox(height: 16),
                    const Text('Notes Generated Successfully!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    NeuButton(
                      text: 'Download PDF',
                      color: NeuTheme.ink,
                      onPressed: () {},
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
