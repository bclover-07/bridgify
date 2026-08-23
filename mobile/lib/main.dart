import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/neu_theme.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/router/app_router.dart';
import 'core/network/api_client.dart';
import 'core/storage/local_db.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  
  await LocalDB.init();
  await ApiClient.init();

  // Load Google Fonts for the theme
  GoogleFonts.config.allowRuntimeFetching = true;

  runApp(
    EasyLocalization(
      supportedLocales: const [
        Locale('en'),
        Locale('hi'),
        Locale('mr'),
        Locale('te'),
        Locale('ta'),
      ],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      child: const ProviderScope(
        child: BridgifyApp(),
      ),
    ),
  );
}

class BridgifyApp extends ConsumerWidget {
  const BridgifyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Bridgify',
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      theme: NeuTheme.themeData.copyWith(
        textTheme: GoogleFonts.spaceGroteskTextTheme(),
      ),
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
    );
  }
}

class InitialScreen extends StatelessWidget {
  const InitialScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'app_title'.tr(),
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Testing locale change
                final locale = context.locale.languageCode == 'en' ? const Locale('hi') : const Locale('en');
                context.setLocale(locale);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: NeuTheme.electric,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Change Language'),
            ),
          ],
        ),
      ),
    );
  }
}
