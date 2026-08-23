import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class StudentProfileScreen extends ConsumerStatefulWidget {
  const StudentProfileScreen({super.key});

  @override
  ConsumerState<StudentProfileScreen> createState() => _StudentProfileScreenState();
}

class _StudentProfileScreenState extends ConsumerState<StudentProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final response = await ApiClient.instance.get('/api/student/profile/academics');
      setState(() {
        _profile = response.data['profile'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _profile = null;
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load profile: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user ?? {};

    return Scaffold(
      appBar: AppBar(
        title: const Text('Academic Profile'),
        backgroundColor: NeuTheme.sky,
        foregroundColor: NeuTheme.ink,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: NeuTheme.sky))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  NeuCard(
                    backgroundColor: NeuTheme.paper,
                    child: Row(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: NeuTheme.sky,
                            border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.person, size: 40, color: NeuTheme.ink),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(user['name'] ?? 'Student', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(user['email'] ?? 'No Email', style: const TextStyle(fontSize: 14)),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (_profile != null) ...[
                    NeuCard(
                      backgroundColor: Colors.white,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Academic Record', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NeuTheme.sky)),
                          const Divider(color: NeuTheme.ink, thickness: 2),
                          const SizedBox(height: 8),
                          _buildProfileRow('Branch', _profile!['branch'] ?? 'N/A'),
                          _buildProfileRow('Year', _profile!['year']?.toString() ?? 'N/A'),
                          _buildProfileRow('SGPA', _profile!['sgpa']?.toString() ?? 'N/A'),
                          _buildProfileRow('Active Backlogs', _profile!['activeBacklogs']?.toString() ?? '0'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    NeuCard(
                      backgroundColor: Colors.white,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Verified Skills', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NeuTheme.coral)),
                          const Divider(color: NeuTheme.ink, thickness: 2),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: (_profile!['skills'] as List<dynamic>? ?? []).map<Widget>((s) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: NeuTheme.sky,
                                border: Border.all(color: NeuTheme.ink, width: 2),
                                borderRadius: BorderRadius.circular(NeuTheme.radiusButton),
                              ),
                              child: Text(s.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                            )).toList(),
                          )
                        ],
                      ),
                    ),
                  ] else 
                    const Center(child: Text("No academic profile found."))
                ],
              ),
            ),
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          Text(value, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}
