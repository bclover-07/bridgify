allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}

subprojects {
    project.plugins.withId("com.android.library") {
        project.extensions.findByName("android")?.let { androidExt ->
            try {
                val namespaceMethod = androidExt.javaClass.getMethod("getNamespace")
                val currentNamespace = namespaceMethod.invoke(androidExt)
                if (currentNamespace == null) {
                    val setNamespaceMethod = androidExt.javaClass.getMethod("setNamespace", String::class.java)
                    val generatedNamespace = "com.example.legacy." + project.name.replace("-", "_")
                    setNamespaceMethod.invoke(androidExt, generatedNamespace)
                }
            } catch (e: Exception) { }
        }
    }
}
