import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class FairHiringScreen extends ConsumerStatefulWidget {
  const FairHiringScreen({super.key});

  @override
  ConsumerState<FairHiringScreen> createState() => _FairHiringScreenState();
}

class _FairHiringScreenState extends ConsumerState<FairHiringScreen> {
  bool isLoading = true;
  String selectedDrive = "Summer Internship 2026";
  final List<String> drives = [
    "Summer Internship 2026",
    "FTE Software Engineer",
    "Data Science Associate",
  ];

  @override
  void initState() {
    super.initState();
    _fetchDiversityData();
  }

  Future<void> _fetchDiversityData() async {
    setState(() => isLoading = true);
    try {
      await ApiClient.instance.get('/api/recruiter/diversity', queryParameters: {"drive": selectedDrive});
      setState(() => isLoading = false);
    } catch (e) {
      // Offline fallback: data is mocked in charts
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fair Hiring Analytics'),
        backgroundColor: NeuTheme.acid,
        foregroundColor: NeuTheme.ink,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: selectedDrive,
                  isExpanded: true,
                  icon: const Icon(Icons.keyboard_arrow_down, color: NeuTheme.ink),
                  items: drives.map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontWeight: FontWeight.bold)))).toList(),
                  onChanged: (v) {
                    if (v != null) {
                      setState(() => selectedDrive = v);
                      _fetchDiversityData();
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: isLoading
                ? const Center(child: CircularProgressIndicator(color: NeuTheme.acid))
                : SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            children: [
                              const Text('Gender Diversity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 16),
                              SizedBox(
                                height: 200,
                                child: PieChart(
                                  PieChartData(
                                    sectionsSpace: 2,
                                    centerSpaceRadius: 40,
                                    sections: [
                                      PieChartSectionData(value: 55, color: NeuTheme.mint, title: 'Male', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                      PieChartSectionData(value: 40, color: NeuTheme.hotpink, title: 'Female', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                      PieChartSectionData(value: 5, color: NeuTheme.sky, title: 'Other', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Bias Analysis', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  const Icon(Icons.check_circle, color: NeuTheme.mint),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: RichText(
                                      text: const TextSpan(
                                        style: TextStyle(color: NeuTheme.ink, fontSize: 14),
                                        children: [
                                          TextSpan(text: 'Skill Matching: ', style: TextStyle(fontWeight: FontWeight.bold)),
                                          TextSpan(text: 'High alignment with required skills (92% match). No significant degree bias detected.'),
                                        ],
                                      ),
                                    ),
                                  )
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  const Icon(Icons.warning, color: NeuTheme.amber),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: RichText(
                                      text: const TextSpan(
                                        style: TextStyle(color: NeuTheme.ink, fontSize: 14),
                                        children: [
                                          TextSpan(text: 'Geographic Diversity: ', style: TextStyle(fontWeight: FontWeight.bold)),
                                          TextSpan(text: 'Candidates are heavily concentrated in Tier 1 cities (78%). Consider expanding outreach.'),
                                        ],
                                      ),
                                    ),
                                  )
                                ],
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
            )
          ],
        ),
      ),
    );
  }
}
