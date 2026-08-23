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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            NeuCard(
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
            const SizedBox(height: 24),
            if (isSimulating)
              const Center(child: CircularProgressIndicator(color: NeuTheme.electric))
            else ...[
              NeuCard(
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
              const SizedBox(height: 24),
              NeuCard(
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
              const SizedBox(height: 24),
              NeuCard(
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
            ]
          ],
        ),
      ),
    );
  }
}
