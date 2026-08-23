import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';
import 'package:intl/intl.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  bool isLoading = true;
  List<dynamic> transactions = [];
  int verifiedSkillsCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchWallet();
  }

  Future<void> _fetchWallet() async {
    try {
      final response = await ApiClient.instance.get('/api/student/seg');
      final edges = response.data['edges'] as List<dynamic>? ?? [];
      final nodes = response.data['nodes'] as List<dynamic>? ?? [];
      
      setState(() {
        transactions = edges;
        verifiedSkillsCount = nodes.length;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        transactions = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load wallet: ${e.toString()}')));
      }
    }
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('yyyy-MM-dd HH:mm').format(date);
    } catch (e) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Skill Wallet (Blockchain)'),
        backgroundColor: NeuTheme.mint,
        foregroundColor: NeuTheme.ink,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.mint))
        : Padding(
            padding: const EdgeInsets.all(16),
            child: PageTransition(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  StaggerItem(
                    index: 0,
                    child: NeuCard(
                      backgroundColor: NeuTheme.ink,
                      child: Column(
                        children: [
                          const Text(
                            'Total Verified Skills',
                            style: TextStyle(color: Colors.white70, fontSize: 16),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '$verifiedSkillsCount',
                            style: const TextStyle(color: NeuTheme.mint, fontSize: 48, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  StaggerItem(
                    index: 1,
                    child: const Text('Ledger Transactions (Evidence Logs)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: transactions.isEmpty 
                    ? const Center(child: Text("No transactions recorded on the ledger."))
                    : ListView.separated(
                      itemCount: transactions.length,
                      separatorBuilder: (context, index) => const Divider(color: NeuTheme.ink, thickness: NeuTheme.borderWidth),
                      itemBuilder: (context, index) {
                        final t = transactions[index];
                        final isVerified = true; 
                        return StaggerItem(
                          index: index + 2,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Row(
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: isVerified ? NeuTheme.mint : NeuTheme.amber,
                                    border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Icon(isVerified ? Icons.verified : Icons.pending, size: 24),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(t['evidenceType'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      Text('${t['context']} | ${_formatDate(t['timestamp'] ?? '')}', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                                    ],
                                  ),
                                ),
                                Text(
                                  '+${t['scoreContributed'] ?? 0}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    color: isVerified ? NeuTheme.mint : NeuTheme.amber,
                                  ),
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  StaggerItem(
                    index: 1,
                    child: SizedBox(
                      width: double.infinity,
                      child: NeuButton(
                        text: 'Share Wallet Link',
                        onPressed: _shareWallet,
                        backgroundColor: NeuTheme.electric,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
  }

  Future<void> _shareWallet() async {
    try {
      final response = await ApiClient.instance.post('/api/student/wallet/share', data: {});
      final link = response.data['shareLink'];
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: NeuTheme.paper,
            shape: RoundedRectangleBorder(
              side: const BorderSide(color: NeuTheme.ink, width: NeuTheme.borderWidth),
              borderRadius: BorderRadius.circular(0),
            ),
            title: const Text('Wallet Link Created', style: TextStyle(fontWeight: FontWeight.bold)),
            content: SelectableText(link),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close', style: TextStyle(color: NeuTheme.ink, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to share wallet: $e')));
      }
    }
  }
}
