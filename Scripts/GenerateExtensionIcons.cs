#!/usr/bin/env dotnet run
// PNG to Chrome Extension Icons Converter using SixLabors.ImageSharp
// Usage: dotnet Scripts/GenerateExtensionIcons.cs [inputPng] [outputDir]
// Default: CopyRichURL_icon.png -> icons/

#:package SixLabors.ImageSharp@3.1.12

using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

// Parse arguments
string inputPngPath = args.Length > 0
    ? args[0]
    : "icons/CopyRichURL_icon.png";

string outputDirectory = args.Length > 1
    ? args[1]
    : "icons";

Console.WriteLine($"Generating Chrome Extension Icons...");
Console.WriteLine($"  Input:  {Path.GetFullPath(inputPngPath)}");
Console.WriteLine($"  Output: {Path.GetFullPath(outputDirectory)}");

if (!File.Exists(inputPngPath))
{
    Console.WriteLine($"ERROR: Input file not found: {inputPngPath}");
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
    using var sourceImage = Image.Load<Rgba32>(inputPngPath);
    Console.WriteLine($"  Source size: {sourceImage.Width}x{sourceImage.Height}");

    foreach (int size in iconSizes)
    {
        // Chrome icons should be square. 
        // Since the input might not be square (120x72), we'll pad it to square before resizing
        // or just resize it to fit within the square.

        int maxDimension = Math.Max(sourceImage.Width, sourceImage.Height);
        using var squareImage = new Image<Rgba32>(maxDimension, maxDimension);

        // Center the source image on the square canvas
        int xOffset = (maxDimension - sourceImage.Width) / 2;
        int yOffset = (maxDimension - sourceImage.Height) / 2;

        squareImage.Mutate(ctx => ctx.DrawImage(sourceImage, new Point(xOffset, yOffset), 1f));

        // Now resize the square image to the target size
        squareImage.Mutate(ctx => ctx.Resize(size, size));

        string outputFileName = Path.Combine(outputDirectory, $"icon{size}.png");
        squareImage.SaveAsPng(outputFileName);

        Console.WriteLine($"    Generated {size}x{size} -> {outputFileName}");
    }

    Console.WriteLine($"SUCCESS: Generated all icons in {outputDirectory}");
}
catch (Exception ex)
{
    Console.WriteLine($"ERROR: {Path.GetFileName(Environment.GetCommandLineArgs()[0])}:{ex.Message}");
    Environment.Exit(1);
}