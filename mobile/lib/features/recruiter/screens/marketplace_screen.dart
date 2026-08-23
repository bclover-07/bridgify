import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen> {
  bool isLoading = true;
  List<dynamic> _problemStatements = [];

  @override
  void initState() {
    super.initState();
    _fetchMarketplace();
  }

  Future<void> _fetchMarketplace() async {
    try {
      final response = await ApiClient.instance.get('/api/recruiter/marketplace');
      setState(() {
        _problemStatements = response.data['problemStatements'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        _problemStatements = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load marketplace: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live PS Marketplace'),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.electric))
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: Row(
                    children: [
                      const Icon(Icons.storefront, color: NeuTheme.electric, size: 32),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Text(
                          'Published Problem Statements',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: NeuTheme.hotpink,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text('LIVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: _problemStatements.isEmpty 
                  ? const Center(child: Text('No problem statements in marketplace.'))
                  : ListView.builder(
                    itemCount: _problemStatements.length,
                    itemBuilder: (context, index) {
                      final item = _problemStatements[index];
                      final company = item['recruiterId']?['recruiter']?['company'] ?? 'Unknown Company';
                      
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
                                  Expanded(
                                    child: Text(
                                      item['title'] ?? 'Untitled PS',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                                    ),
                                  ),
                                  NeuButton(
                                    text: 'View',
                                    backgroundColor: NeuTheme.electric,
                                    textColor: Colors.white,
                                    onPressed: () {},
                                  )
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.business, size: 16, color: NeuTheme.ink),
                                  const SizedBox(width: 4),
                                  Text(company, style: const TextStyle(fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.all(12),
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: NeuTheme.paper,
                                  border: Border.all(color: NeuTheme.ink, width: 1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  item['description'] ?? 'No description provided.',
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: (item['skillsRequired'] as List<dynamic>? ?? []).map<Widget>((skill) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: NeuTheme.mint,
                                      border: Border.all(color: NeuTheme.ink, width: 1),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Text(skill.toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  );
                                }).toList(),
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
