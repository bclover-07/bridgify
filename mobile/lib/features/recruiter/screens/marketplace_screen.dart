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
  List<dynamic> feedItems = [];

  @override
  void initState() {
    super.initState();
    _fetchMarketplace();
  }

  Future<void> _fetchMarketplace() async {
    try {
      final response = await ApiClient.instance.get('/api/recruiter/marketplace');
      setState(() {
        feedItems = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        feedItems = [
          {
            "id": "1",
            "student": "Arjun Kumar",
            "action": "completed a Capstone Project",
            "details": "E-Commerce Microservices with 99.9% uptime test.",
            "time": "10 mins ago"
          },
          {
            "id": "2",
            "student": "Sarah Lee",
            "action": "achieved top 5% in Coding Assessment",
            "details": "Data Structures and Algorithms Hard Level",
            "time": "1 hour ago"
          },
          {
            "id": "3",
            "student": "Ravi Patel",
            "action": "earned a new skill badge",
            "details": "Advanced Flutter UI Development",
            "time": "3 hours ago"
          },
        ];
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Talent Marketplace'),
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
                      const Icon(Icons.radar, color: NeuTheme.electric, size: 32),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Text(
                          'Live Feed of Student Achievements',
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
                  child: ListView.builder(
                    itemCount: feedItems.length,
                    itemBuilder: (context, index) {
                      final item = feedItems[index];
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
                                  Text(
                                    item['time'],
                                    style: TextStyle(color: Colors.grey[700], fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                  NeuButton(
                                    text: 'View Profile',
                                    color: NeuTheme.electric,
                                    textColor: Colors.white,
                                    onPressed: () {},
                                  )
                                ],
                              ),
                              const SizedBox(height: 8),
                              RichText(
                                text: TextSpan(
                                  style: const TextStyle(color: NeuTheme.ink, fontSize: 16),
                                  children: [
                                    TextSpan(text: item['student'], style: const TextStyle(fontWeight: FontWeight.bold)),
                                    TextSpan(text: ' ${item['action']}\n'),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.all(12),
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: NeuTheme.paper,
                                  border: Border.all(color: NeuTheme.ink, width: 1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(item['details'], style: const TextStyle(fontStyle: FontStyle.italic)),
                              ),
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
