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

    setState(() {
      isLoading = true;
      candidates = [];
    });
    try {
      final response = await ApiClient.instance.post('/api/recruiter/search/semantic', data: {"jobDescription": query});
      setState(() {
        candidates = response.data['candidates'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        candidates = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Search failed: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _shortlistCandidate(String studentId, String name) async {
    try {
      await ApiClient.instance.post('/api/recruiter/shortlist', data: {"studentId": studentId});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Shortlisted $name successfully')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to shortlist: ${e.toString()}')));
      }
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
                    backgroundColor: NeuTheme.sky,
                    onPressed: isLoading ? null : _performSearch,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (isLoading)
              const Expanded(child: Center(child: CircularProgressIndicator(color: NeuTheme.sky)))
            else if (candidates.isNotEmpty) ...[
              const Text('Search Results', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  itemCount: candidates.length,
                  itemBuilder: (context, index) {
                    final candidate = candidates[index];
                    final matchedSkills = (candidate['matchedSkills'] as List<dynamic>? ?? []);
                    
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
                                Text(candidate['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                NeuButton(
                                  text: 'Shortlist',
                                  backgroundColor: NeuTheme.mint,
                                  onPressed: () => _shortlistCandidate(candidate['studentId'], candidate['name'] ?? 'Candidate'),
                                )
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.school, size: 16, color: NeuTheme.ink),
                                const SizedBox(width: 4),
                                Text('CGPA: ${candidate['cgpa'] ?? 'N/A'}'),
                                const SizedBox(width: 16),
                                const Icon(Icons.speed, size: 16, color: NeuTheme.ink),
                                const SizedBox(width: 4),
                                Text('Match: ${candidate['matchScore'] ?? 0}%'),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: matchedSkills.take(5).map<Widget>((skill) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: NeuTheme.electric,
                                    border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(skill['skillLabel'] ?? 'Skill', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
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
            ] else if (_searchController.text.isNotEmpty && !isLoading) ...[
              const Expanded(child: Center(child: Text("No candidates found.")))
            ]
          ],
        ),
      ),
    );
  }
}
