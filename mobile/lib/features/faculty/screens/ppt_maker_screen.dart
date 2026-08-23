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
  final TextEditingController _slidesController = TextEditingController(text: '10');
  bool _isGenerating = false;
  List<dynamic> _slides = [];

  Future<void> _generatePPT() async {
    if (_topicController.text.trim().isEmpty) return;
    setState(() => _isGenerating = true);
    
    try {
      final response = await ApiClient.instance.post('/api/faculty/ppt/generate', data: {
        "topic": _topicController.text,
        "num_slides": int.tryParse(_slidesController.text) ?? 10,
      });
      setState(() {
        _slides = response.data['data'] ?? [];
        _isGenerating = false;
      });
    } catch (e) {
      setState(() {
        _slides = List.generate(
          int.tryParse(_slidesController.text) ?? 5,
          (i) => {"title": "Slide ${i + 1}", "content": "Auto-generated content for slide ${i + 1} about ${_topicController.text}."},
        );
        _isGenerating = false;
      });
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
                  const Text('Create Presentation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _topicController,
                    hintText: 'Topic (e.g. History of Web)',
                  ),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _slidesController,
                    hintText: 'Number of Slides',
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Generating...' : 'Generate PPT',
                    color: NeuTheme.hotpink,
                    onPressed: _isGenerating ? null : _generatePPT,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (_slides.isNotEmpty) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Preview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  NeuButton(
                    text: 'Download .pptx',
                    color: NeuTheme.mint,
                    onPressed: () {},
                  )
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  itemCount: _slides.length,
                  itemBuilder: (context, index) {
                    final slide = _slides[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: AspectRatio(
                        aspectRatio: 16 / 9,
                        child: NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                slide['title'],
                                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                slide['content'],
                                style: TextStyle(fontSize: 14, color: Colors.grey[800]),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
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
