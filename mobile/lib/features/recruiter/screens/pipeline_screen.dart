import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class PipelineScreen extends ConsumerStatefulWidget {
  const PipelineScreen({super.key});

  @override
  ConsumerState<PipelineScreen> createState() => _PipelineScreenState();
}

class _PipelineScreenState extends ConsumerState<PipelineScreen> {
  bool isLoading = true;
  List<dynamic> pipelineData = [];
  final List<String> stages = ["applied", "shortlisted", "interview", "offered"];
  String selectedStage = "applied";

  @override
  void initState() {
    super.initState();
    _fetchPipeline();
  }

  Future<void> _fetchPipeline() async {
    try {
      final response = await ApiClient.instance.get('/api/recruiter/pipeline');
      setState(() {
        pipelineData = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        pipelineData = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load pipeline: ${e.toString()}')));
      }
    }
  }

  Future<void> _updateStage(dynamic candidate, String newStage) async {
    final oldStage = candidate['stage'];
    setState(() {
      candidate['stage'] = newStage;
    });
    try {
      await ApiClient.instance.post('/api/recruiter/pipeline/update', data: {
        "id": candidate['id'],
        "stage": newStage,
        "driveId": candidate['driveId'],
      });
    } catch (e) {
      setState(() {
        candidate['stage'] = oldStage; // Revert on failure
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update stage: ${e.toString()}')));
      }
    }
  }

  String _formatStageName(String stage) {
    return stage[0].toUpperCase() + stage.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    final displayedCandidates = pipelineData.where((c) => c['stage'] == selectedStage).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recruitment Pipeline'),
        backgroundColor: NeuTheme.mint,
        foregroundColor: NeuTheme.ink,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.mint))
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: stages.map((stage) {
                        final isSelected = stage == selectedStage;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: NeuButton(
                            text: _formatStageName(stage),
                            color: isSelected ? NeuTheme.mint : Colors.white,
                            onPressed: () => setState(() => selectedStage = stage),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${_formatStageName(selectedStage)} Candidates (${displayedCandidates.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: displayedCandidates.isEmpty
                  ? const Center(child: Text("No candidates in this stage."))
                  : ListView.builder(
                    itemCount: displayedCandidates.length,
                    itemBuilder: (context, index) {
                      final candidate = displayedCandidates[index];
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
                                  Text(candidate['name'] ?? 'Candidate', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: NeuTheme.mint,
                                      border: Border.all(color: NeuTheme.ink),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text('CGPA: ${candidate['score'] ?? 'N/A'}'),
                                  )
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: NeuButton(
                                      text: 'View Profile',
                                      color: Colors.white,
                                      onPressed: () {},
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: DropdownButtonHideUnderline(
                                      child: Container(
                                        height: 48,
                                        decoration: BoxDecoration(
                                          color: NeuTheme.sky,
                                          border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                          borderRadius: BorderRadius.circular(4),
                                          boxShadow: const [
                                            BoxShadow(
                                              color: NeuTheme.ink,
                                              offset: Offset(NeuTheme.shadowOffset, NeuTheme.shadowOffset),
                                            )
                                          ]
                                        ),
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: DropdownButton<String>(
                                          value: selectedStage,
                                          icon: const Icon(Icons.arrow_drop_down, color: NeuTheme.ink),
                                          isExpanded: true,
                                          items: stages.map((s) => DropdownMenuItem(value: s, child: Text('Move to ${_formatStageName(s)}', style: const TextStyle(fontSize: 14)))).toList(),
                                          onChanged: (v) {
                                            if (v != null && v != selectedStage) _updateStage(candidate, v);
                                          },
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                )
              ],
            ),
          ),
    );
  }
}
