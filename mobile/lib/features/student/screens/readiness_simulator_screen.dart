import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class ReadinessSimulatorScreen extends ConsumerStatefulWidget {
  const ReadinessSimulatorScreen({super.key});

  @override
  ConsumerState<ReadinessSimulatorScreen> createState() => _ReadinessSimulatorScreenState();
}

class _ReadinessSimulatorScreenState extends ConsumerState<ReadinessSimulatorScreen> {
  bool isLoading = true;
  Map<String, dynamic>? data;
  String targetRole = 'Software Engineer';
  List<String> availableRoles = [];
  bool isSimulating = false;

  @override
  void initState() {
    super.initState();
    _fetchRoles();
  }

  Future<void> _fetchRoles() async {
    try {
      final response = await ApiClient.instance.get('/api/student/readiness');
      final roles = response.data['roles'] as List<dynamic>? ?? [];
      setState(() {
        availableRoles = roles.map((r) => r['label'] as String).toList();
        if (availableRoles.isNotEmpty && !availableRoles.contains(targetRole)) {
          targetRole = availableRoles.first;
        }
      });
      await _fetchData();
    } catch (e) {
      if (mounted) {
        setState(() => isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load roles: ${e.toString()}')));
      }
    }
  }

  Future<void> _fetchData() async {
    setState(() => isSimulating = true);
    try {
      final response = await ApiClient.instance.get('/api/student/readiness?targetRole=${Uri.encodeComponent(targetRole)}');
      setState(() {
        data = response.data['readiness'];
        isLoading = false;
        isSimulating = false;
      });
    } catch (e) {
      setState(() {
        data = null; // No mock data
        isLoading = false;
        isSimulating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load readiness: ${e.toString()}')));
      }
    }
  }

  Future<void> _simulateWhatIf(int newTech, int newSoft, int newApt) async {
    setState(() => isSimulating = true);
    try {
      final response = await ApiClient.instance.post(
        '/api/student/readiness/what-if',
        data: {
          'targetRole': targetRole,
          'hypotheticalScores': {
            'technical': newTech,
            'softSkills': newSoft,
            'aptitude': newApt,
          }
        },
      );
      setState(() {
        data = response.data['readiness'];
        isSimulating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Simulation complete. (Not saved)')));
      }
    } catch (e) {
      setState(() => isSimulating = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Simulation failed: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: NeuTheme.electric)),
      );
    }

    final techScore = data?['technical'] ?? 0;
    final softScore = data?['softSkills'] ?? 0;
    final aptScore = data?['aptitude'] ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Readiness Simulator'),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
      ),
      body: PageTransition(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              StaggerItem(
                index: 0,
                child: NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Select Target Role', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      if (availableRoles.isNotEmpty)
                        DropdownButtonHideUnderline(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: DropdownButton<String>(
                              value: targetRole,
                              isExpanded: true,
                              items: availableRoles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                              onChanged: (v) {
                                if (v != null) {
                                  setState(() => targetRole = v);
                                  _fetchData();
                                }
                              },
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              if (isSimulating)
                const Center(child: CircularProgressIndicator(color: NeuTheme.electric))
              else ...[
                StaggerItem(
                  index: 1,
                  child: NeuCard(
                    backgroundColor: NeuTheme.cyan,
                    child: Column(
                      children: [
                        const Text('Technical Readiness', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: LinearProgressIndicator(
                                value: techScore / 100,
                                backgroundColor: Colors.white,
                                color: NeuTheme.ink,
                                minHeight: 20,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Text('$techScore%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                StaggerItem(
                  index: 2,
                  child: NeuCard(
                    backgroundColor: NeuTheme.hotpink,
                    child: Column(
                      children: [
                        const Text('Soft Skills Readiness', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: LinearProgressIndicator(
                                value: softScore / 100,
                                backgroundColor: Colors.white,
                                color: NeuTheme.ink,
                                minHeight: 20,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Text('$softScore%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                StaggerItem(
                  index: 3,
                  child: NeuCard(
                    backgroundColor: NeuTheme.amber,
                    child: Column(
                      children: [
                        const Text('Aptitude Readiness', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: LinearProgressIndicator(
                                value: aptScore / 100,
                                backgroundColor: Colors.white,
                                color: NeuTheme.ink,
                                minHeight: 20,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Text('$aptScore%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                StaggerItem(
                  index: 4,
                  child: SizedBox(
                    width: double.infinity,
                    child: NeuButton(
                      text: 'Run What-If Simulation',
                      backgroundColor: NeuTheme.sky,
                      onPressed: () => _showWhatIfDialog(techScore.toInt(), softScore.toInt(), aptScore.toInt()),
                    ),
                  ),
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }

  void _showWhatIfDialog(int currentTech, int currentSoft, int currentApt) {
    int t = currentTech, s = currentSoft, a = currentApt;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: NeuTheme.paper,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: NeuTheme.ink, width: NeuTheme.borderWidth),
          borderRadius: BorderRadius.circular(0),
        ),
        title: const Text('What-If Scenario', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Add +10 points to a skill to simulate impact on overall readiness.'),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: () { Navigator.pop(context); _simulateWhatIf(t + 10, s, a); }, child: const Text('+10 Technical')),
            ElevatedButton(onPressed: () { Navigator.pop(context); _simulateWhatIf(t, s + 10, a); }, child: const Text('+10 Soft Skills')),
            ElevatedButton(onPressed: () { Navigator.pop(context); _simulateWhatIf(t, s, a + 10); }, child: const Text('+10 Aptitude')),
          ],
        ),
      )
    );
  }
}
