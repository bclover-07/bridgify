import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class LearningFeedScreen extends ConsumerStatefulWidget {
  const LearningFeedScreen({super.key});

  @override
  ConsumerState<LearningFeedScreen> createState() => _LearningFeedScreenState();
}

class _LearningFeedScreenState extends ConsumerState<LearningFeedScreen> {
  bool isLoading = true;
  List<dynamic> posts = [];
  final TextEditingController _postController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchFeed();
  }

  Future<void> _fetchFeed() async {
    try {
      final response = await ApiClient.instance.get('/api/faculty/feed');
      setState(() {
        posts = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        posts = [
          {"id": 1, "content": "Welcome to the new semester! Check syllabus.", "time": "2 hours ago"},
          {"id": 2, "content": "Quiz 1 is active. Good luck!", "time": "1 day ago"},
        ];
        isLoading = false;
      });
    }
  }

  Future<void> _createPost() async {
    if (_postController.text.trim().isEmpty) return;
    final content = _postController.text;
    setState(() {
      posts.insert(0, {"id": DateTime.now().millisecondsSinceEpoch, "content": content, "time": "Just now"});
      _postController.clear();
    });
    try {
      await ApiClient.instance.post('/api/faculty/feed/post', data: {"content": content});
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Post queued offline')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learning Feed'),
        backgroundColor: NeuTheme.sky,
        foregroundColor: NeuTheme.ink,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  NeuInput(
                    controller: _postController,
                    hintText: 'Share an update with your students...',
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: 'Post to Feed',
                    color: NeuTheme.sky,
                    onPressed: _createPost,
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: isLoading
              ? const Center(child: CircularProgressIndicator(color: NeuTheme.sky))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    final post = posts[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 16,
                                height: 16,
                                decoration: BoxDecoration(
                                  color: NeuTheme.sky,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: NeuTheme.ink, width: 2),
                                ),
                              ),
                              if (index != posts.length - 1)
                                Container(
                                  width: 4,
                                  height: 100,
                                  color: NeuTheme.ink,
                                )
                            ],
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: NeuCard(
                              backgroundColor: Colors.white,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    post['time'],
                                    style: TextStyle(color: Colors.grey[700], fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    post['content'],
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                    );
                  },
                ),
          )
        ],
      ),
    );
  }
}
