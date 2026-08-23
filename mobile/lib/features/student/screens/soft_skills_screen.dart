import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class SoftSkillsScreen extends ConsumerStatefulWidget {
  const SoftSkillsScreen({super.key});

  @override
  ConsumerState<SoftSkillsScreen> createState() => _SoftSkillsScreenState();
}

class _SoftSkillsScreenState extends ConsumerState<SoftSkillsScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, String>> _messages = [
    {"sender": "ai", "text": "Hello! Let's start the debate. The topic is: 'AI will replace software engineers'. You take the 'against' side. Go ahead!"}
  ];
  bool _isLoading = false;

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty) return;

    final userMessage = _controller.text.trim();
    setState(() {
      _messages.add({"sender": "user", "text": userMessage});
      _controller.clear();
      _isLoading = true;
    });

    try {
      final response = await ApiClient.instance.post('/api/student/soft-skills/chat', data: {"message": userMessage});
      setState(() {
        _messages.add({"sender": "ai", "text": response.data['reply'] ?? "Interesting point! Let's dive deeper."});
        _isLoading = false;
      });
    } catch (e) {
      // Offline fallback
      setState(() {
        _messages.add({"sender": "ai", "text": "I see your point. However, AI can automate repetitive tasks, making engineers focus on higher-level design."});
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Soft Skills Coach'),
        backgroundColor: NeuTheme.amber,
        foregroundColor: NeuTheme.ink,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['sender'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUser ? NeuTheme.electric : NeuTheme.paper,
                      border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: const [BoxShadow(color: NeuTheme.ink, offset: Offset(2, 2))],
                    ),
                    child: Text(
                      msg['text']!,
                      style: TextStyle(
                        fontSize: 16,
                        color: isUser ? Colors.white : NeuTheme.ink,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(color: NeuTheme.amber),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: NeuInput(
                    controller: _controller,
                    hintText: 'Type your argument...',
                  ),
                ),
                const SizedBox(width: 16),
                NeuButton(
                  text: 'Send',
                  color: NeuTheme.amber,
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
