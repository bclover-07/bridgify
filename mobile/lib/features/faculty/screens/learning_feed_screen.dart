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

  @override
  void initState() {
    super.initState();
    _fetchFeed();
  }

  Future<void> _fetchFeed() async {
    try {
      final response = await ApiClient.instance.get('/api/faculty/learning-feed');
      setState(() {
        posts = response.data['feed'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        posts = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load feed: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Industry Learning Feed'),
        backgroundColor: NeuTheme.sky,
        foregroundColor: NeuTheme.ink,
      ),
      body: Column(
        children: [
          Expanded(
            child: isLoading
              ? const Center(child: CircularProgressIndicator(color: NeuTheme.sky))
              : posts.isEmpty 
                  ? const Center(child: Text("No industry demands found.", style: TextStyle(fontSize: 16)))
                  : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    final post = posts[index];
                    final recruiterName = post['recruiterId']?['name'] ?? 'Unknown Recruiter';
                    final company = post['recruiterId']?['recruiter']?['company'] ?? 'Unknown Company';
                    final skillLabel = post['skillLabel'] ?? 'Unknown Skill';
                    final vacancies = post['vacancies'] ?? 0;
                    final urgency = post['urgency'] ?? 'medium';
                    
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
                                    '$recruiterName @ $company',
                                    style: TextStyle(color: Colors.grey[700], fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Demanding: $skillLabel',
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Text('Vacancies: $vacancies | Urgency: ${urgency.toString().toUpperCase()}'),
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
