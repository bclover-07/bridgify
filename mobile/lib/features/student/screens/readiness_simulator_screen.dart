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

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final response = await ApiClient.instance.get('/api/student/readiness');
      setState(() {
        data = response.data['data'];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        data = {
          "technical_readiness": {"score": 85, "areas": {"Python": 90, "System Design": 80}},
          "soft_skills_readiness": {"score": 75, "areas": {"Communication": 70, "Leadership": 80}}
        };
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: NeuTheme.electric)),
      );
    }

    final techScore = data?['technical_readiness']?['score'] ?? 0;
    final softScore = data?['soft_skills_readiness']?['score'] ?? 0;

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
                  const SizedBox(height: 16),
                  ...((data?['technical_readiness']?['areas'] as Map<String, dynamic>?)?.entries.map((e) => 
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(e.key, style: const TextStyle(fontWeight: FontWeight.w600)),
                          Text('${e.value}%', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  ).toList() ?? []),
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
                  const SizedBox(height: 16),
                  ...((data?['soft_skills_readiness']?['areas'] as Map<String, dynamic>?)?.entries.map((e) => 
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(e.key, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
                          Text('${e.value}%', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                    )
                  ).toList() ?? []),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
