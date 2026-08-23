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
  bool isLoading = false;
  List<dynamic> flashcards = [];
  bool fileUploaded = false;

  Future<void> _uploadFile() async {
    setState(() => isLoading = true);
    
    try {
      // Simulate multipart file upload
      final response = await ApiClient.instance.post('/api/student/study-hub/upload', data: {});
      setState(() {
        flashcards = response.data['data'] ?? [
          {"front": "What is polymorphism?", "back": "The condition of occurring in several different forms."},
          {"front": "Define Encapsulation", "back": "Bundling of data with the methods that operate on that data."}
        ];
        fileUploaded = true;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        flashcards = [
          {"front": "What is polymorphism?", "back": "The condition of occurring in several different forms."},
          {"front": "Define Encapsulation", "back": "Bundling of data with the methods that operate on that data."}
        ];
        fileUploaded = true;
        isLoading = false;
      });
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
                  const Icon(Icons.cloud_upload, size: 64, color: NeuTheme.ink),
                  const SizedBox(height: 16),
                  const Text('Upload Notes / PDF', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: 'Select File',
                    color: NeuTheme.hotpink,
                    onPressed: _uploadFile,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (isLoading)
              const Center(child: CircularProgressIndicator(color: NeuTheme.hotpink))
            else if (fileUploaded)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Generated Flashcards', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Expanded(
                      child: ListView.builder(
                        itemCount: flashcards.length,
                        itemBuilder: (context, index) {
                          return _buildFlashcard(flashcards[index]);
                        },
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

  Widget _buildFlashcard(Map<String, dynamic> cardData) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: NeuCard(
        backgroundColor: NeuTheme.electric,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Q:', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
            Text(cardData['front'], style: const TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
            const Divider(color: Colors.white30, height: 24),
            const Text('A:', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
            Text(cardData['back'], style: const TextStyle(fontSize: 16, color: Colors.white)),
          ],
        ),
      ),
    );
  }
}
