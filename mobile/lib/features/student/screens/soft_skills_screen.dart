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
  final TextEditingController _topicController = TextEditingController(text: "AI taking over Software Engineering jobs");
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _isLoading = false;
  bool _sessionStarted = false;

  Future<void> _startSession() async {
    if (_topicController.text.trim().isEmpty) return;
    setState(() => _isLoading = true);

    try {
      final response = await ApiClient.instance.post('/api/student/debate/start', data: {
        "topic": _topicController.text.trim(),
        "side": "against",
      });
      
      setState(() {
        _sessionStarted = true;
        _messages.add({"sender": "ai", "text": response.data['openingArgument'] ?? "Let's begin the debate."});
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _sessionStarted = true;
        _messages.add({"sender": "ai", "text": "Failed to connect to AI Coach."});
        _isLoading = false;
      });
    }
  }

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty) return;

    final userMessage = _controller.text.trim();
    setState(() {
      _messages.add({"sender": "user", "text": userMessage});
      _controller.clear();
      _isLoading = true;
    });

    // The backend does not currently expose a REST endpoint for subsequent rounds.
    // Full real-time voice/socket integration is required for this action.
    if (mounted) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Socket integration required for further debate rounds.'))
      );
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
          if (!_sessionStarted)
            Padding(
              padding: const EdgeInsets.all(16),
              child: NeuCard(
                backgroundColor: NeuTheme.paper,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Start a Debate', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    NeuInput(
                      controller: _topicController,
                      hintText: 'Enter Debate Topic',
                    ),
                    const SizedBox(height: 16),
                    NeuButton(
                      text: _isLoading ? 'Starting...' : 'Start Session',
                      color: NeuTheme.amber,
                      onPressed: _isLoading ? null : _startSession,
                    )
                  ],
                ),
              ),
            ),
          
          if (_sessionStarted)
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
          if (_sessionStarted && _isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(color: NeuTheme.amber),
            ),
          if (_sessionStarted)
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
                    onPressed: _isLoading ? null : _sendMessage,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
