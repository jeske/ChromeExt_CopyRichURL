#!/usr/bin/env dotnet run
// PNG to Chrome Extension Icons Converter
// Usage: dotnet run --file Scripts/GenerateExtensionIcons.cs
// Generates icons from icons_source/CopyRichURL_icon.png

#:package SixLabors.ImageSharp@3.1.12

using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

string sourceIconPath = "icons_source/CopyRichURL_icon.png";
string outputDirectory = "icons";

Console.WriteLine($"Generating Chrome Extension Icons...");
Console.WriteLine($"  Source: {Path.GetFullPath(sourceIconPath)}");
Console.WriteLine($"  Output: {Path.GetFullPath(outputDirectory)}");

if (!File.Exists(sourceIconPath))
{
    Console.WriteLine($"ERROR: Source icon not found: {sourceIconPath}");
    Environment.Exit(1);
}

if (!Directory.Exists(outputDirectory))
{
    Directory.CreateDirectory(outputDirectory);
}

// Chrome extension standard sizes
int[] iconSizes = [16, 32, 48, 128];

try
{
    using var sourceImage = Image.Load<Rgba32>(sourceIconPath);
    Console.WriteLine($"  Source size: {sourceImage.Width}x{sourceImage.Height}");

    foreach (int size in iconSizes)
    {
        int maxDimension = Math.Max(sourceImage.Width, sourceImage.Height);
        using var squareImage = new Image<Rgba32>(maxDimension, maxDimension);

        // Center the source image on the square canvas
        int xOffset = (maxDimension - sourceImage.Width) / 2;
        int yOffset = (maxDimension - sourceImage.Height) / 2;

        squareImage.Mutate(ctx => ctx.DrawImage(sourceImage, new Point(xOffset, yOffset), 1f));
        squareImage.Mutate(ctx => ctx.Resize(size, size));

        string outputFileName = Path.Combine(outputDirectory, $"icon{size}.png");
        squareImage.SaveAsPng(outputFileName);

        Console.WriteLine($"    Generated {size}x{size} -> {outputFileName}");
    }

    Console.WriteLine($"\nSUCCESS: Generated all icons in {outputDirectory}");
}
catch (Exception ex)
{
    Console.WriteLine($"ERROR: {Path.GetFileName(Environment.GetCommandLineArgs()[0])}:{ex.Message}");
    Environment.Exit(1);
}