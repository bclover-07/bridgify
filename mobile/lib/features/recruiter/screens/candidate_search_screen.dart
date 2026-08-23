import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class CandidateSearchScreen extends ConsumerStatefulWidget {
  const CandidateSearchScreen({super.key});

  @override
  ConsumerState<CandidateSearchScreen> createState() => _CandidateSearchScreenState();
}

class _CandidateSearchScreenState extends ConsumerState<CandidateSearchScreen> {
  bool isLoading = false;
  List<dynamic> candidates = [];
  final TextEditingController _searchController = TextEditingController();

  Future<void> _performSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() => isLoading = true);
    try {
      final response = await ApiClient.instance.get('/api/recruiter/search', queryParameters: {"q": query});
      setState(() {
        candidates = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      // Mock data for UI demonstration
      setState(() {
        candidates = [
          {
            "id": "1",
            "name": "Arjun Kumar",
            "skills": ["React.js", "Flutter", "Node.js"],
            "cgpa": "8.5",
            "readiness": "92%"
          },
          {
            "id": "2",
            "name": "Sarah Lee",
            "skills": ["Python", "Machine Learning", "SQL"],
            "cgpa": "9.1",
            "readiness": "88%"
          },
        ];
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Semantic Candidate Search'),
        backgroundColor: NeuTheme.sky,
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
                  NeuInput(
                    controller: _searchController,
                    hintText: 'e.g. "Looking for a fullstack dev who knows React and Node"',
                    maxLines: 2,
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: isLoading ? 'Searching...' : 'Find Candidates',
                    color: NeuTheme.sky,
                    onPressed: isLoading ? null : _performSearch,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (candidates.isNotEmpty) ...[
              const Text('Search Results', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  itemCount: candidates.length,
                  itemBuilder: (context, index) {
                    final candidate = candidates[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: NeuCard(
                        backgroundColor: Colors.white,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(candidate['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                NeuButton(
                                  text: 'Shortlist',
                                  color: NeuTheme.mint,
                                  onPressed: () {},
                                )
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.school, size: 16, color: NeuTheme.ink),
                                const SizedBox(width: 4),
                                Text('CGPA: ${candidate['cgpa']}'),
                                const SizedBox(width: 16),
                                const Icon(Icons.speed, size: 16, color: NeuTheme.ink),
                                const SizedBox(width: 4),
                                Text('Readiness: ${candidate['readiness']}'),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: (candidate['skills'] as List<dynamic>).map<Widget>((skill) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: NeuTheme.electric,
                                    border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(skill, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                );
                              }).toList(),
                            )
                          ],
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
