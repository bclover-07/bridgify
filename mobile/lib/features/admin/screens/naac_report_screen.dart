import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class NAACReportScreen extends ConsumerStatefulWidget {
  const NAACReportScreen({super.key});

  @override
  ConsumerState<NAACReportScreen> createState() => _NAACReportScreenState();
}

class _NAACReportScreenState extends ConsumerState<NAACReportScreen> {
  DateTime? _startDate;
  DateTime? _endDate;
  bool _isGenerating = false;
  String? _generatedReport;

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: NeuTheme.amber,
              onPrimary: NeuTheme.ink,
              surface: NeuTheme.paper,
              onSurface: NeuTheme.ink,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (isStart) _startDate = picked;
        else _endDate = picked;
      });
    }
  }

  Future<void> _generateReport() async {
    if (_startDate == null || _endDate == null) return;
    setState(() => _isGenerating = true);
    
    try {
      final response = await ApiClient.instance.post('/api/admin/naac-report/generate', data: {
        "start_date": _startDate!.toIso8601String(),
        "end_date": _endDate!.toIso8601String(),
      });
      setState(() {
        _generatedReport = response.data['report'] ?? "Report generated but empty.";
        _isGenerating = false;
      });
    } catch (e) {
      setState(() {
        _generatedReport = null; // No mock data
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate report: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NAAC Report Generator'),
        backgroundColor: NeuTheme.amber,
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
                  const Text('Select Academic Period', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: NeuButton(
                          text: _startDate != null ? _startDate!.toString().split(' ')[0] : 'Start Date',
                          color: Colors.white,
                          textColor: NeuTheme.ink,
                          onPressed: () => _selectDate(context, true),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: NeuButton(
                          text: _endDate != null ? _endDate!.toString().split(' ')[0] : 'End Date',
                          color: Colors.white,
                          textColor: NeuTheme.ink,
                          onPressed: () => _selectDate(context, false),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  NeuButton(
                    text: _isGenerating ? 'Analyzing Metrics...' : 'Generate AI Report',
                    color: NeuTheme.amber,
                    onPressed: _isGenerating ? null : _generateReport,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (_generatedReport != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Generated SSR', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  NeuButton(
                    text: 'Export PDF',
                    color: NeuTheme.mint,
                    onPressed: () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: NeuCard(
                  backgroundColor: Colors.white,
                  child: SingleChildScrollView(
                    child: Text(
                      _generatedReport!,
                      style: const TextStyle(fontSize: 14, height: 1.5),
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
