import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _institutionCodeController = TextEditingController();
  String _selectedRole = 'student';

  final List<String> _roles = ['student', 'faculty', 'admin', 'recruiter'];

  void _handleRegister() async {
    final authNotifier = ref.read(authProvider.notifier);
    
    final success = await authNotifier.registerUser(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      role: _selectedRole,
      institutionCode: _institutionCodeController.text.trim(),
    );

    if (success && mounted) {
      context.go('/$_selectedRole');
    }
  }

  Widget _buildLanguageSwitcher(BuildContext context) {
    return Align(
      alignment: Alignment.topRight,
      child: PopupMenuButton<Locale>(
        initialValue: context.locale,
        onSelected: (Locale locale) {
          context.setLocale(locale);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: NeuTheme.acid,
            border: Border.all(color: NeuTheme.ink, width: 2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.language, size: 18, color: NeuTheme.ink),
              const SizedBox(width: 8),
              Text(
                context.locale.languageCode.toUpperCase(),
                style: const TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.ink),
              ),
            ],
          ),
        ),
        itemBuilder: (BuildContext context) => <PopupMenuEntry<Locale>>[
          const PopupMenuItem<Locale>(value: Locale('en'), child: Text('English (EN)')),
          const PopupMenuItem<Locale>(value: Locale('hi'), child: Text('हिंदी (HI)')),
          const PopupMenuItem<Locale>(value: Locale('mr'), child: Text('मराठी (MR)')),
          const PopupMenuItem<Locale>(value: Locale('te'), child: Text('తెలుగు (TE)')),
          const PopupMenuItem<Locale>(value: Locale('ta'), child: Text('தமிழ் (TA)')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: NeuTheme.paper,
      appBar: AppBar(
        title: Text('app_title'.tr(), style: const TextStyle(fontWeight: FontWeight.w900, color: NeuTheme.ink)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: NeuTheme.ink),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              top: -50,
              right: -50,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(color: NeuTheme.violet.withOpacity(0.1), shape: BoxShape.circle),
              ),
            ),
            Positioned(
              bottom: -50,
              left: -50,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(color: NeuTheme.mint.withOpacity(0.1), shape: BoxShape.circle),
              ),
            ),
            SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildLanguageSwitcher(context),
                  const SizedBox(height: 10),
                  const Icon(
                    Icons.person_add_alt_1,
                    size: 56,
                    color: NeuTheme.ink,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'create_account'.tr(),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: NeuTheme.ink,
                      letterSpacing: -1,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  
                  NeuCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'i_am_a'.tr(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: NeuTheme.ink,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Role Selector
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _roles.map((role) {
                            final isSelected = _selectedRole == role;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedRole = role),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? NeuTheme.electric : Colors.white,
                                  border: Border.all(color: NeuTheme.ink, width: 2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  role.tr(),
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : NeuTheme.ink,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 24),

                        NeuInput(
                          hintText: 'full_name'.tr(),
                          controller: _nameController,
                        ),
                        const SizedBox(height: 16),
                        NeuInput(
                          hintText: 'email'.tr(),
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 16),
                        NeuInput(
                          hintText: 'password'.tr(),
                          controller: _passwordController,
                          obscureText: true,
                        ),
                        const SizedBox(height: 16),
                        NeuInput(
                          hintText: 'institution_code'.tr(),
                          controller: _institutionCodeController,
                        ),
                        
                        if (authState.error != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(top: 16),
                            decoration: BoxDecoration(
                              color: Colors.red[50],
                              border: Border.all(color: NeuTheme.coral, width: 2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '⚠️ ${authState.error!}',
                              style: const TextStyle(color: NeuTheme.coral, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],

                        const SizedBox(height: 32),
                        NeuButton(
                          text: authState.isLoading ? '...' : 'create_account'.tr(),
                          backgroundColor: NeuTheme.hotpink,
                          onPressed: authState.isLoading ? () {} : _handleRegister,
                        ),
                        const SizedBox(height: 16),
                        GestureDetector(
                          onTap: () => context.push('/login'),
                          child: Text(
                            'already_have_account'.tr(),
                            style: const TextStyle(color: NeuTheme.electric, fontWeight: FontWeight.bold, fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
