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
  String? selectedDriveId;
  List<dynamic> drives = [];
  Map<String, dynamic>? diversityData;

  @override
  void initState() {
    super.initState();
    _fetchDrives();
  }

  Future<void> _fetchDrives() async {
    try {
      final response = await ApiClient.instance.get('/api/recruiter/dashboard');
      setState(() {
        drives = response.data['recentDrives'] ?? [];
        if (drives.isNotEmpty) {
          selectedDriveId = drives[0]['_id'];
          _fetchDiversityData();
        } else {
          isLoading = false;
        }
      });
    } catch (e) {
      setState(() {
        drives = [];
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load drives: ${e.toString()}')));
      }
    }
  }

  Future<void> _fetchDiversityData() async {
    if (selectedDriveId == null) return;
    setState(() => isLoading = true);
    try {
      final response = await ApiClient.instance.get('/api/recruiter/fair-hiring/$selectedDriveId');
      setState(() {
        diversityData = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        diversityData = null; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load fair hiring data: ${e.toString()}')));
      }
    }
  }

  List<PieChartSectionData> _generateChartData(Map<String, dynamic> distribution) {
    if (distribution.isEmpty) {
      return [PieChartSectionData(value: 100, color: Colors.grey, title: 'No Data', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))];
    }
    final colors = [NeuTheme.mint, NeuTheme.hotpink, NeuTheme.sky, NeuTheme.amber, NeuTheme.violet, NeuTheme.coral];
    int colorIndex = 0;
    return distribution.entries.map((e) {
      final color = colors[colorIndex % colors.length];
      colorIndex++;
      return PieChartSectionData(
        value: (e.value as num).toDouble(),
        color: color,
        title: '${e.key}\n${e.value}',
        radius: 50,
        titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: NeuTheme.ink),
      );
    }).toList();
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
            if (drives.isNotEmpty)
              NeuCard(
                backgroundColor: NeuTheme.paper,
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: selectedDriveId,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: NeuTheme.ink),
                    items: drives.map((d) {
                      return DropdownMenuItem(
                        value: d['_id'] as String,
                        child: Text('${d['company']} Drive', style: const TextStyle(fontWeight: FontWeight.bold)),
                      );
                    }).toList(),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => selectedDriveId = v);
                        _fetchDiversityData();
                      }
                    },
                  ),
                ),
              ),
            if (drives.isEmpty && !isLoading)
              const Center(child: Text('No drives available')),
            const SizedBox(height: 24),
            Expanded(
              child: isLoading
                ? const Center(child: CircularProgressIndicator(color: NeuTheme.acid))
                : diversityData == null 
                  ? const Center(child: Text('No data found.'))
                  : SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            children: [
                              const Text('Branch Distribution', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 16),
                              SizedBox(
                                height: 200,
                                child: PieChart(
                                  PieChartData(
                                    sectionsSpace: 2,
                                    centerSpaceRadius: 40,
                                    sections: _generateChartData(diversityData?['branchDistribution'] ?? {}),
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
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const Text('Stage Distribution', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 16),
                              SizedBox(
                                height: 200,
                                child: PieChart(
                                  PieChartData(
                                    sectionsSpace: 2,
                                    centerSpaceRadius: 40,
                                    sections: _generateChartData(diversityData?['stageDistribution'] ?? {}),
                                  ),
                                ),
                              ),
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
