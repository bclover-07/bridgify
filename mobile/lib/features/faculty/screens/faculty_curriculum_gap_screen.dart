import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class FacultyCurriculumGapScreen extends ConsumerStatefulWidget {
  const FacultyCurriculumGapScreen({super.key});

  @override
  ConsumerState<FacultyCurriculumGapScreen> createState() => _FacultyCurriculumGapScreenState();
}

class _FacultyCurriculumGapScreenState extends ConsumerState<FacultyCurriculumGapScreen> {
  final TextEditingController _skillsController = TextEditingController();
  bool _isAnalyzing = false;
  Map<String, dynamic>? _analysisResult;

  Future<void> _analyzeGap() async {
    if (_skillsController.text.trim().isEmpty) return;
    setState(() => _isAnalyzing = true);
    
    try {
      final response = await ApiClient.instance.post('/api/faculty/curriculum-gap', data: {
        "targetIndustrySkills": _skillsController.text.trim(),
      });
      setState(() {
        _analysisResult = response.data['gapAnalysis'];
        _isAnalyzing = false;
      });
    } catch (e) {
      setState(() {
        _analysisResult = null;
        _isAnalyzing = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Analysis failed: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Curriculum Gap Analysis'),
        backgroundColor: NeuTheme.hotpink,
        foregroundColor: Colors.white,
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
                  const Text('Analyze Syllabus vs Industry', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _skillsController,
                    hintText: 'Target Industry Skills (e.g. React, Docker, CI/CD)',
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isAnalyzing ? 'Analyzing Agent AI...' : 'Run Analysis',
                    backgroundColor: NeuTheme.hotpink,
                    textColor: Colors.white,
                    onPressed: _isAnalyzing ? null : _analyzeGap,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (_analysisResult != null) ...[
              const Text('Analysis Results', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Expanded(
                child: NeuCard(
                  backgroundColor: Colors.white,
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Missing Skills', style: TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.coral)),
                        const Divider(color: NeuTheme.ink, thickness: 2),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: (_analysisResult!['missingSkills'] as List<dynamic>? ?? []).map<Widget>((s) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: NeuTheme.coral, borderRadius: BorderRadius.circular(4), border: Border.all(color: NeuTheme.ink)),
                            child: Text(s.toString(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          )).toList(),
                        ),
                        const SizedBox(height: 16),
                        const Text('Covered Skills', style: TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.mint)),
                        const Divider(color: NeuTheme.ink, thickness: 2),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: (_analysisResult!['coveredSkills'] as List<dynamic>? ?? []).map<Widget>((s) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: NeuTheme.mint, borderRadius: BorderRadius.circular(4), border: Border.all(color: NeuTheme.ink)),
                            child: Text(s.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                          )).toList(),
                        ),
                        const SizedBox(height: 16),
                        const Text('Recommendations', style: TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.sky)),
                        const Divider(color: NeuTheme.ink, thickness: 2),
                        ...(_analysisResult!['recommendations'] as List<dynamic>? ?? []).map((r) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Text('• $r', style: const TextStyle(fontSize: 14)),
                        )),
                      ],
                    ),
                  ),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
