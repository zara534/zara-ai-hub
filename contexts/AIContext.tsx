import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { AIPersona, PersonaType, Announcement, Comment } from '../types';
import { useLocalStorage } from '../components/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

// Define the admin email address in a constant for clarity and easy maintenance.
const ADMIN_EMAIL = 'admin@zaraaihub.com';

// Note to developer: Personas are stored in the user's local browser storage.
// They are not connected to Supabase to allow for offline use and easy user customization without database writes.
const initialCustomPersonas: AIPersona[] = [
    { id: 'logo-designer-v1', name: 'Logo Designer', icon: '✨', type: PersonaType.IMAGE, description: 'Generates clean, modern, and minimalist logos for businesses and projects.', systemPrompt: 'minimalist logo, vector, flat design, professional', examplePrompt: 'A minimalist logo for a coffee shop named "The Daily Grind"', isDefault: false, model: 'flux' },
    { id: 'character-artist-v1', name: 'Character Concept Artist', icon: '👤', type: PersonaType.IMAGE, description: 'Creates detailed character concepts for games, stories, and animations.', systemPrompt: 'character concept art, detailed, full body, fantasy, cinematic lighting', examplePrompt: 'Concept art of a stoic elven ranger with a bow and arrow', isDefault: false, model: 'flux' },
    { id: 'architect-viz-v1', name: 'Architectural Visualizer', icon: '🏢', type: PersonaType.IMAGE, description: 'Produces photorealistic visualizations of architectural designs and interiors.', systemPrompt: 'architectural rendering, photorealistic, modern architecture, interior design, 8k', examplePrompt: 'Photorealistic rendering of a modern glass house in a forest', isDefault: false, model: 'flux' },
    { id: 'food-photo-v1', name: 'Food Photographer', icon: '🍔', type: PersonaType.IMAGE, description: 'Creates delicious-looking, high-quality photos of various food items.', systemPrompt: 'food photography, delicious, vibrant colors, detailed, professional lighting', examplePrompt: 'A gourmet burger with melted cheese and fresh toppings, studio lighting', isDefault: false, model: 'flux' },
    { id: 'fantasy-painter-v1', name: 'Fantasy Landscape Painter', icon: '🏞️', type: PersonaType.IMAGE, description: 'Paints breathtaking, epic fantasy landscapes with magical elements.', systemPrompt: 'fantasy landscape, epic, matte painting, breathtaking, detailed, magical', examplePrompt: 'An epic painting of a dragon flying over a medieval castle', isDefault: false, model: 'flux' },
    { id: 'tshirt-designer-v1', name: 'T-shirt Graphic Designer', icon: '👕', type: PersonaType.IMAGE, description: 'Designs unique and trendy graphics suitable for T-shirt printing.', systemPrompt: 't-shirt graphic design, vector art, clean, bold, trending', examplePrompt: 'A retro graphic of a cassette tape with the text "Sounds of the 80s"', isDefault: false, model: 'flux' },
    { id: 'vintage-poster-v1', name: 'Vintage Poster Creator', icon: '📜', type: PersonaType.IMAGE, description: 'Generates posters with a retro or vintage aesthetic from the 20th century.', systemPrompt: 'vintage poster, retro style, 1960s, textured, graphic design', examplePrompt: 'A travel poster for Paris in the style of the 1920s', isDefault: false, model: 'flux' },
    { id: '3d-modeler-v1', name: '3D Modeler', icon: '🧊', type: PersonaType.IMAGE, description: 'Renders high-quality 3D models of objects and scenes.', systemPrompt: '3d render, octane render, high detail, 4k, cinematic', examplePrompt: 'High-detail 3D render of a futuristic sci-fi helmet', isDefault: false, model: 'flux' },
    { id: 'abstract-art-v1', name: 'Abstract Art Generator', icon: '🌀', type: PersonaType.IMAGE, description: 'Creates unique and colorful abstract art pieces in various styles.', systemPrompt: 'abstract art, colorful, vibrant, modern, masterpiece', examplePrompt: 'A vibrant and chaotic explosion of colors, digital abstract art', isDefault: false, model: 'flux' },
    { id: 'storybook-illustrator-v1', name: 'Storybook Illustrator', icon: '🖍️', type: PersonaType.IMAGE, description: 'Illustrates charming and whimsical scenes for children\'s books.', systemPrompt: 'children\'s book illustration, whimsical, charming, colorful, watercolor style', examplePrompt: 'A charming watercolor illustration of a fox reading a book under a tree', isDefault: false, model: 'flux' },
    { id: 'comic-book-artist-v1', name: 'Comic Book Artist', icon: '💥', type: PersonaType.IMAGE, description: 'Creates dynamic comic book style panels and characters.', systemPrompt: 'comic book style, dynamic action, bold lines, vibrant colors, halftone dots', examplePrompt: 'A dynamic comic book panel of a superhero landing in a city street', isDefault: false, model: 'flux' },
    { id: 'pixel-artist-v1', name: 'Pixel Artist', icon: '👾', type: PersonaType.IMAGE, description: 'Generates retro pixel art sprites, characters, and scenes.', systemPrompt: 'pixel art, 16-bit, retro gaming, sprite sheet', examplePrompt: 'A 16-bit pixel art scene of a knight fighting a slime in a dungeon', isDefault: false, model: 'flux' },
    { id: 'tattoo-designer-v1', name: 'Tattoo Designer', icon: '✒️', type: PersonaType.IMAGE, description: 'Designs unique tattoo concepts in various styles like traditional, watercolor, or geometric.', systemPrompt: 'tattoo design, line art, black and white, flash sheet style', examplePrompt: 'A black and white tattoo design of a wolf howling at the moon, geometric style', isDefault: false, model: 'flux' },
    { id: 'product-photographer-v1', name: 'Product Photographer', icon: '🛍️', type: PersonaType.IMAGE, description: 'Creates clean, professional product shots for e-commerce and advertising.', systemPrompt: 'product photography, clean background, studio lighting, commercial, 4k', examplePrompt: 'A clean product shot of a luxury watch on a dark background', isDefault: false, model: 'flux' },
    { id: 'watercolor-painter-v1', name: 'Watercolor Painter', icon: '🎨', type: PersonaType.IMAGE, description: 'Paints delicate and beautiful scenes with a watercolor aesthetic.', systemPrompt: 'watercolor painting, soft edges, vibrant washes, paper texture', examplePrompt: 'A delicate watercolor painting of a bouquet of wildflowers', isDefault: false, model: 'flux' },
    { id: 'album-cover-artist-v1', name: 'Album Cover Artist', icon: '💿', type: PersonaType.IMAGE, description: 'Designs striking and memorable album covers for musicians.', systemPrompt: 'album cover art, psychedelic, minimalist, typography, iconic', examplePrompt: 'A surreal and psychedelic album cover for an indie rock band', isDefault: false, model: 'flux' },
    { id: 'fashion-designer-v1', name: 'Fashion Designer', icon: '👗', type: PersonaType.IMAGE, description: 'Sketches new fashion concepts and clothing designs.', systemPrompt: 'fashion design sketch, runway model, haute couture, detailed fabric', examplePrompt: 'A fashion sketch of an elegant evening gown with intricate details', isDefault: false, model: 'flux' },
    { id: 'cyberpunk-city-v1', name: 'Cyberpunk Cityscaper', icon: '🏙️', type: PersonaType.IMAGE, description: 'Generates neon-drenched, futuristic cyberpunk cityscapes.', systemPrompt: 'cyberpunk city, neon lights, rainy, futuristic, dystopian, blade runner style', examplePrompt: 'A rainy cyberpunk city street with glowing neon signs and flying vehicles', isDefault: false, model: 'flux' },
    { id: 'interior-designer-v1', name: 'Interior Designer', icon: '🛋️', type: PersonaType.IMAGE, description: 'Visualizes interior design concepts for homes and offices.', systemPrompt: 'interior design, modern, cozy, scandinavian style, realistic render', examplePrompt: 'A cozy living room with a fireplace and Scandinavian furniture', isDefault: false, model: 'flux' },
    { id: 'wildlife-photographer-v1', name: 'Wildlife Photographer', icon: '🦁', type: PersonaType.IMAGE, description: 'Captures stunning, high-detail photos of animals in their natural habitat.', systemPrompt: 'wildlife photography, national geographic, tack sharp, natural lighting', examplePrompt: 'A sharp, detailed photograph of a snow leopard on a rocky cliff', isDefault: false, model: 'flux' },
    { id: 'horror-artist-v1', name: 'Horror Artist', icon: '👻', type: PersonaType.IMAGE, description: 'Creates chilling and atmospheric horror scenes and creatures.', systemPrompt: 'horror, dark, atmospheric, creepy, lovecraftian, cinematic lighting', examplePrompt: 'A creature from the deep sea emerging from foggy waters, lovecraftian horror', isDefault: false, model: 'flux' },
    { id: 'sticker-designer-v1', name: 'Sticker Designer', icon: '🏷️', type: PersonaType.IMAGE, description: 'Designs cute and cool die-cut stickers.', systemPrompt: 'die-cut sticker design, vector, cute, chibi, pop culture', examplePrompt: 'A cute die-cut sticker of a cartoon avocado doing yoga', isDefault: false, model: 'flux' },
    { id: 'blueprint-drafter-v1', name: 'Blueprint Drafter', icon: '📐', type: PersonaType.IMAGE, description: 'Creates technical blueprint drawings of machines, buildings, or vehicles.', systemPrompt: 'blueprint, technical drawing, schematic, detailed, white on blue', examplePrompt: 'A detailed blueprint of a classic muscle car', isDefault: false, model: 'flux' },
    { id: 'food-illustrator-v1', name: 'Food Illustrator', icon: '🍰', type: PersonaType.IMAGE, description: 'Creates stylized and appetizing illustrations of food.', systemPrompt: 'food illustration, stylized, flat design, vibrant colors, recipe book style', examplePrompt: 'A stylized illustration of a slice of cherry pie for a recipe book', isDefault: false, model: 'flux' },
    { id: 'steampunk-inventor-v1', name: 'Steampunk Inventor', icon: '⚙️', type: PersonaType.IMAGE, description: 'Designs intricate steampunk gadgets, vehicles, and characters.', systemPrompt: 'steampunk, intricate gears, brass and copper, victorian style, detailed', examplePrompt: 'A complex steampunk-style mechanical owl with glowing eyes', isDefault: false, model: 'flux' },
    { id: 'mythical-creature-v1', name: 'Mythical Creature Creator', icon: '🐉', type: PersonaType.IMAGE, description: 'Brings mythical creatures from legends and folklore to life.', systemPrompt: 'mythical creature, legendary, fantasy art, detailed, powerful stance', examplePrompt: 'A majestic phoenix with fiery wings rising from ashes', isDefault: false, model: 'flux' },
    { id: 'isometric-diorama-v1', name: 'Isometric Diorama Builder', icon: '🗺️', type: PersonaType.IMAGE, description: 'Creates charming isometric 3D dioramas of rooms and landscapes.', systemPrompt: 'isometric diorama, cute, low poly, 3d render, detailed miniature', examplePrompt: 'A cute low-poly isometric diorama of a video game developer\'s room', isDefault: false, model: 'flux' },
    { id: 'coloring-book-v1', name: 'Coloring Book Creator', icon: '📖', type: PersonaType.IMAGE, description: 'Generates detailed coloring book pages for adults and children.', systemPrompt: 'coloring book page, intricate patterns, clean line art, black and white', examplePrompt: 'An intricate mandala coloring book page with floral patterns', isDefault: false, model: 'flux' },
    { id: 'car-designer-v1', name: 'Automotive Designer', icon: '🏎️', type: PersonaType.IMAGE, description: 'Sketches and renders concept cars and vehicles.', systemPrompt: 'concept car design, automotive sketch, futuristic, aerodynamic, studio render', examplePrompt: 'A sleek concept sketch of an electric sports car of the future', isDefault: false, model: 'flux' },
    { id: 'jewellery-designer-v1', name: 'Jewellery Designer', icon: '💍', type: PersonaType.IMAGE, description: 'Creates designs for intricate and beautiful pieces of jewellery.', systemPrompt: 'jewellery design, photorealistic, diamonds and gold, intricate details, macro shot', examplePrompt: 'A photorealistic render of an emerald and diamond necklace', isDefault: false, model: 'flux' },
    { id: 'pattern-generator-v1', name: 'Pattern Generator', icon: '🌿', type: PersonaType.IMAGE, description: 'Generates seamless, tileable patterns for fabrics and backgrounds.', systemPrompt: 'seamless pattern, tileable, floral, geometric, vector art', examplePrompt: 'A seamless pattern of tropical leaves and flowers, vector style', isDefault: false, model: 'flux' },
    { id: 'ui-mockup-generator-v1', name: 'UI Mockup Generator', icon: '📱', type: PersonaType.IMAGE, description: 'Creates mockups of user interfaces for mobile apps and websites.', systemPrompt: 'ui design, mobile app, website mockup, clean, modern, figma style', examplePrompt: 'A clean mockup of a mobile banking app homescreen', isDefault: false, model: 'flux' },
    { id: 'infographic-designer-v1', name: 'Infographic Designer', icon: '📊', type: PersonaType.IMAGE, description: 'Designs clear and visually appealing infographics.', systemPrompt: 'infographic design, vector, flat icons, data visualization, clean layout', examplePrompt: 'An infographic about the benefits of drinking water with flat icons', isDefault: false, model: 'flux' },
    { id: 'drone-shot-creator-v1', name: 'Drone Shot Creator', icon: '🚁', type: PersonaType.IMAGE, description: 'Generates epic aerial drone shots of landscapes and cities.', systemPrompt: 'aerial drone shot, top-down view, 4k, epic landscape, coastline, cinematic', examplePrompt: 'An epic aerial drone shot of a tropical beach with turquoise water', isDefault: false, model: 'flux' },
    { id: 'mecha-designer-v1', name: 'Mecha Designer', icon: '🤖', type: PersonaType.IMAGE, description: 'Designs powerful and detailed giant robots (Mecha).', systemPrompt: 'mecha, giant robot, detailed, sci-fi, gundam style, powerful', examplePrompt: 'A giant, heavily-armed mecha robot standing in a destroyed city', isDefault: false, model: 'flux' },
    { id: 'stained-glass-v1', name: 'Stained Glass Artist', icon: '💠', type: PersonaType.IMAGE, description: 'Creates images with the look of stained glass windows.', systemPrompt: 'stained glass window, intricate, vibrant colors, bold black lines, backlit', examplePrompt: 'A beautiful stained glass window depicting a forest scene at sunset', isDefault: false, model: 'flux' },
    { id: 'oil-painter-v1', name: 'Oil Painter', icon: '🖼️', type: PersonaType.IMAGE, description: 'Creates images with a classic oil painting texture and style.', systemPrompt: 'oil painting, thick brush strokes, textured canvas, classic art, masterpiece', examplePrompt: 'A classic oil painting of a stormy sea with a lighthouse', isDefault: false, model: 'flux' },
    { id: 'manga-artist-v1', name: 'Manga Artist', icon: '🎌', type: PersonaType.IMAGE, description: 'Creates black and white manga panels and characters.', systemPrompt: 'manga panel, black and white, screentones, dynamic, shonen style', examplePrompt: 'A black and white manga panel of two characters having an emotional conversation', isDefault: false, model: 'flux' },
    { id: 'voxel-artist-v1', name: 'Voxel Artist', icon: '🧱', type: PersonaType.IMAGE, description: 'Builds scenes and objects out of 3D cubes (voxels).', systemPrompt: 'voxel art, 3d pixels, cute, vibrant colors, isometric, magicavoxel', examplePrompt: 'Voxel art of a small, cozy cabin in a snowy forest', isDefault: false, model: 'flux' },
    { id: 'greeting-card-v1', name: 'Greeting Card Illustrator', icon: '💌', type: PersonaType.IMAGE, description: 'Designs charming illustrations for greeting cards.', systemPrompt: 'greeting card illustration, cute, whimsical, holiday theme, watercolor style', examplePrompt: 'A cute watercolor illustration of a bear holding a birthday cake', isDefault: false, model: 'flux' },
    { id: 'synthwave-artist-v1', name: 'Synthwave Artist', icon: '🌆', type: PersonaType.IMAGE, description: 'Creates vibrant, 80s retro-futuristic synthwave and outrun style artwork.', systemPrompt: 'synthwave, outrun, retrofuturism, 80s aesthetic, neon grid, vibrant colors, futuristic car', examplePrompt: 'A DeLorean car driving on a neon grid road towards a synthwave sunset', isDefault: false, model: 'flux' },
    { id: 'minimalist-line-artist-v1', name: 'Minimalist Line Artist', icon: '✍️', type: PersonaType.IMAGE, description: 'Generates simple, elegant one-line drawings and minimalist art.', systemPrompt: 'minimalist line art, single line drawing, clean, simple, black and white', examplePrompt: 'A single continuous line drawing of a cat sleeping', isDefault: false, model: 'flux' },
    { id: 'graffiti-artist-v1', name: 'Graffiti Artist', icon: '🎨', type: PersonaType.IMAGE, description: 'Creates vibrant and dynamic street art and graffiti style visuals.', systemPrompt: 'graffiti art, street art, spray paint, vibrant colors, urban, tags, mural', examplePrompt: 'A bold graffiti mural on a brick wall with the word "CREATE"', isDefault: false, model: 'flux' },
    { id: 'fantasy-map-maker-v1', name: 'Fantasy Map Maker', icon: '🧭', type: PersonaType.IMAGE, description: 'Designs intricate fantasy maps for tabletop RPGs, books, and games.', systemPrompt: 'fantasy map, top-down, cartography, vintage paper, detailed, compass rose, sea monsters', examplePrompt: 'A detailed fantasy map of a forgotten kingdom with mountains, forests, and a dragon\'s lair', isDefault: false, model: 'flux' },
    { id: 'ukiyo-e-artist-v1', name: 'Ukiyo-e Artist', icon: '🌊', type: PersonaType.IMAGE, description: 'Generates images in the style of traditional Japanese Ukiyo-e woodblock prints.', systemPrompt: 'ukiyo-e style, Japanese woodblock print, bold outlines, flat colors, Hokusai style', examplePrompt: 'A samurai warrior standing under a cherry blossom tree, in the style of Ukiyo-e', isDefault: false, model: 'flux' },
    { id: 'claymation-artist-v1', name: 'Claymation Artist', icon: '🏺', type: PersonaType.IMAGE, description: 'Creates charming scenes that look like they are made from modeling clay.', systemPrompt: 'claymation style, plasticine, stop motion, detailed texture, Aardman animations style', examplePrompt: 'A claymation scene of two penguins having a tea party on an iceberg', isDefault: false, model: 'flux' },
    { id: 'botanical-illustrator-v1', name: 'Botanical Illustrator', icon: '🪴', type: PersonaType.IMAGE, description: 'Creates detailed and scientifically accurate illustrations of plants, flowers, and fungi.', systemPrompt: 'botanical illustration, scientific drawing, detailed, vintage, watercolor and ink, white background', examplePrompt: 'A detailed botanical illustration of a sunflower, showing its petals, stem, and leaves', isDefault: false, model: 'flux' },
    { id: 'cosmic-artist-v1', name: 'Cosmic Artist', icon: '🌌', type: PersonaType.IMAGE, description: 'Paints breathtaking views of galaxies, nebulae, planets, and other cosmic phenomena.', systemPrompt: 'space art, cosmic, nebula, galaxy, stars, vibrant colors, detailed, deep space', examplePrompt: 'A vibrant and colorful nebula with swirling gases and newborn stars', isDefault: false, model: 'flux' },
    { id: 'pop-art-creator-v1', name: 'Pop Art Creator', icon: '💄', type: PersonaType.IMAGE, description: 'Generates artwork in the iconic Pop Art style of the 1950s and 60s.', systemPrompt: 'pop art, Andy Warhol style, bold colors, halftone dots, screenprint look, iconic', examplePrompt: 'A pop art portrait of a cat in four different color panels, Andy Warhol style', isDefault: false, model: 'flux' },
    { id: 'storyboard-artist-v1', name: 'Storyboard Artist', icon: '🎬', type: PersonaType.IMAGE, description: 'Creates sequences of drawings to visualize scenes for film, animation, or commercials.', systemPrompt: 'storyboard panel, cinematic, black and white sketch, dynamic composition, action scene', examplePrompt: 'A 3-panel storyboard of a car chase scene, showing a close-up, a wide shot, and a crash', isDefault: false, model: 'flux' },
    { id: 'game-asset-designer-v1', name: 'Game Asset Designer', icon: '💎', type: PersonaType.IMAGE, description: 'Designs 2D assets for video games, such as items, icons, and sprites on a clean background.', systemPrompt: 'game asset, icon, item, sprite, 2d, high detail, clean background, fantasy RPG', examplePrompt: 'A set of magic potion icons for an RPG game, on a transparent background', isDefault: false, model: 'flux' },
    { id: 'architectural-sketcher-v1', name: 'Architectural Sketcher', icon: '✏️', type: PersonaType.IMAGE, description: 'Creates artistic, hand-drawn sketches of architectural concepts and buildings.', systemPrompt: 'architectural sketch, hand-drawn, pencil and ink, concept art, loose style', examplePrompt: 'A hand-drawn ink sketch of a futuristic skyscraper with organic shapes', isDefault: false, model: 'flux' },
    { id: 'origami-master-v1', name: 'Origami Master', icon: '🕊️', type: PersonaType.IMAGE, description: 'Generates images of intricate and beautiful origami figures made from folded paper.', systemPrompt: 'origami, folded paper art, intricate, detailed, clean studio lighting, single object', examplePrompt: 'A complex and beautiful origami dragon on a plain white background', isDefault: false, model: 'flux' },
    { id: 'ancient-hieroglyphics-v1', name: 'Ancient Hieroglyphics Artist', icon: '🏛️', type: PersonaType.IMAGE, description: 'Creates art in the style of ancient Egyptian hieroglyphics and tomb paintings.', systemPrompt: 'ancient egyptian hieroglyphics, tomb painting style, papyrus texture, traditional colors', examplePrompt: 'An Egyptian wall painting depicting a pharaoh making an offering to the god Anubis', isDefault: false, model: 'flux' },
    { id: 'solarpunk-futurist-v1', name: 'Solarpunk Futurist', icon: '🌱', type: PersonaType.IMAGE, description: 'Envisions optimistic, sustainable futures where nature and technology coexist harmoniously.', systemPrompt: 'solarpunk, futuristic city, sustainable architecture, lush greenery, renewable energy, utopian', examplePrompt: 'A solarpunk city with buildings covered in plants and bridges connecting futuristic towers', isDefault: false, model: 'flux' },
    { id: 'gothic-macabre-artist-v1', name: 'Gothic Macabre Artist', icon: '💀', type: PersonaType.IMAGE, description: 'Creates dark, atmospheric illustrations with a gothic and macabre aesthetic.', systemPrompt: 'gothic art, macabre, dark, detailed ink drawing, victorian gothic, atmospheric', examplePrompt: 'A detailed ink drawing of a raven perched on a skull in a moonlit graveyard', isDefault: false, model: 'flux' },
    { id: 'tribal-art-creator-v1', name: 'Tribal Art Creator', icon: '🗿', type: PersonaType.IMAGE, description: 'Generates art inspired by indigenous and tribal patterns from around the world.', systemPrompt: 'tribal art, indigenous patterns, geometric, bold lines, earthy colors, symbolic', examplePrompt: 'A stylized wolf design using pacific northwest tribal art style', isDefault: false, model: 'flux' },
    { id: 'knit-crochet-designer-v1', name: 'Knit & Crochet Designer', icon: '🧶', type: PersonaType.IMAGE, description: 'Generates realistic images of knitted and crocheted items, patterns, and textures.', systemPrompt: 'knitted texture, crocheted, yarn, cozy, detailed stitches, macro shot', examplePrompt: 'A close-up photo of a chunky, hand-knitted wool blanket in cream color', isDefault: false, model: 'flux' },
    { id: 'hologram-projector-v1', name: 'Hologram Projector', icon: '💡', type: PersonaType.IMAGE, description: 'Creates futuristic, glowing hologram projections of objects and interfaces.', systemPrompt: 'hologram, futuristic, glowing, translucent, blue light, sci-fi interface, on dark background', examplePrompt: 'A glowing blue hologram of the Earth projected in a dark room', isDefault: false, model: 'flux' },
    { id: 'food-plating-designer-v1', name: 'Food Plating Designer', icon: '🍽️', type: PersonaType.IMAGE, description: 'Designs and visualizes high-end, artistic food plating for gourmet dishes.', systemPrompt: 'gourmet food plating, michelin star, artistic, top-down view, fine dining, delicate', examplePrompt: 'A beautifully plated seared scallop dish with a swirl of pea puree and edible flowers', isDefault: false, model: 'flux' },
    { id: 'surrealist-dreamer-v1', name: 'Surrealist Dreamer', icon: '👁️', type: PersonaType.IMAGE, description: 'Generates bizarre and dreamlike scenes in the style of surrealist masters.', systemPrompt: 'surrealism, dreamlike, bizarre, Salvador Dali style, subconscious mind', examplePrompt: 'A melting clock draped over a tree branch in a desert landscape', isDefault: false, model: 'flux' },
    { id: 'art-nouveau-illustrator-v1', name: 'Art Nouveau Illustrator', icon: '🦢', type: PersonaType.IMAGE, description: 'Creates elegant illustrations with flowing lines and organic forms, inspired by the Art Nouveau movement.', systemPrompt: 'art nouveau, Alphonse Mucha style, elegant, decorative, flowing lines, floral motifs', examplePrompt: 'An elegant woman with flowing hair surrounded by flowers, Art Nouveau style', isDefault: false, model: 'flux' },
    { id: 'cubist-painter-v1', name: 'Cubist Painter', icon: '🎸', type: PersonaType.IMAGE, description: 'Paints subjects from multiple viewpoints in a geometric, abstract style like Picasso.', systemPrompt: 'cubism, abstract, geometric, multiple viewpoints, Picasso style', examplePrompt: 'A cubist painting of a person playing a guitar', isDefault: false, model: 'flux' },
    { id: 'impressionist-artist-v1', name: 'Impressionist Artist', icon: '🖌️', type: PersonaType.IMAGE, description: 'Creates paintings with visible brush strokes and an emphasis on light, in the style of Monet.', systemPrompt: 'impressionism, Claude Monet style, visible brush strokes, light and color, en plein air', examplePrompt: 'An impressionist painting of a lily pond at sunrise', isDefault: false, model: 'flux' },
    { id: 'technical-infographic-v1', name: 'Technical Infographic Artist', icon: '📈', type: PersonaType.IMAGE, description: 'Designs detailed technical infographics with a focus on data and clarity.', systemPrompt: 'technical infographic, detailed, data visualization, clean, professional, blueprint style', examplePrompt: 'An infographic explaining how a jet engine works', isDefault: false, model: 'flux' },
    { id: 'vehicle-wrap-designer-v1', name: 'Vehicle Wrap Designer', icon: '🚚', type: PersonaType.IMAGE, description: 'Creates eye-catching graphic designs for vehicle wraps and branding.', systemPrompt: 'vehicle wrap design, car wrap, vinyl graphics, bold, brand identity', examplePrompt: 'A dynamic racing stripe design for a sports car wrap', isDefault: false, model: 'flux' },
    { id: 'sci-fi-book-cover-v1', name: 'Sci-Fi Book Cover Artist', icon: '🚀', type: PersonaType.IMAGE, description: 'Designs epic and compelling book covers for science fiction novels.', systemPrompt: 'sci-fi book cover, epic, cinematic, spaceship, planet, futuristic typography', examplePrompt: 'A book cover featuring a lone astronaut looking at a giant alien planet', isDefault: false, model: 'flux' },
    { id: 'noir-film-stills-v1', name: 'Noir Film Still Creator', icon: '🕵️', type: PersonaType.IMAGE, description: 'Generates dramatic, high-contrast black and white images in the style of classic film noir.', systemPrompt: 'film noir, black and white, high contrast, dramatic shadows, 1940s style, cinematic', examplePrompt: 'A detective in a fedora standing in a rain-slicked alley at night, film noir style', isDefault: false, model: 'flux' },
    { id: 'macro-photographer-v1', name: 'Macro Photographer', icon: '🔬', type: PersonaType.IMAGE, description: 'Captures extreme close-up shots of small subjects like insects or water droplets.', systemPrompt: 'macro photography, extreme close-up, detailed, sharp focus, shallow depth of field', examplePrompt: 'A macro photo of a ladybug on a leaf with dew drops', isDefault: false, model: 'flux' },
    { id: 'low-poly-modeler-v1', name: 'Low Poly Modeler', icon: '🔺', type: PersonaType.IMAGE, description: 'Creates stylized 3D scenes and objects with a low polygon count aesthetic.', systemPrompt: 'low poly, 3d render, stylized, vibrant colors, isometric landscape', examplePrompt: 'A low poly isometric scene of a floating island with a single tree', isDefault: false, model: 'flux' },
    { id: 'paper-cut-artist-v1', name: 'Paper Cut Artist', icon: '✂️', type: PersonaType.IMAGE, description: 'Generates intricate layered art that looks like it was made from cut paper.', systemPrompt: 'paper cut art, layered paper, kirigami, intricate, shadow box effect', examplePrompt: 'A layered paper cut artwork of a deer in a forest', isDefault: false, model: 'flux' },
    { id: 'zentangle-artist-v1', name: 'Zentangle Artist', icon: '🕸️', type: PersonaType.IMAGE, description: 'Creates abstract art using structured, repetitive patterns (Zentangles).', systemPrompt: 'zentangle, intricate patterns, black and white, detailed line work, abstract', examplePrompt: 'A detailed zentangle drawing of an owl', isDefault: false, model: 'flux' },
    { id: 'doodle-artist-v1', name: 'Doodle Artist', icon: '✏️', type: PersonaType.IMAGE, description: 'Generates fun, chaotic, and creative doodle-style illustrations.', systemPrompt: 'doodle art, sketchbook, chaotic, fun characters, black and white', examplePrompt: 'A page full of chaotic and fun monster doodles', isDefault: false, model: 'flux' },
    { id: 'astrology-illustrator-v1', name: 'Astrology Illustrator', icon: '✨', type: PersonaType.IMAGE, description: 'Creates beautiful illustrations related to zodiac signs and astrology.', systemPrompt: 'astrology, zodiac sign, celestial, mystical, detailed line art, constellations', examplePrompt: 'An elegant illustration of the Leo zodiac sign with a lion and stars', isDefault: false, model: 'flux' },
    { id: 'dystopian-environment-v1', name: 'Dystopian Environment Artist', icon: '🌆', type: PersonaType.IMAGE, description: 'Creates dark, gritty, and oppressive dystopian environments and cityscapes.', systemPrompt: 'dystopian city, post-apocalyptic, gritty, oppressive atmosphere, cinematic', examplePrompt: 'A matte painting of a ruined city under a polluted orange sky', isDefault: false, model: 'flux' },
    { id: 'art-deco-designer-v1', name: 'Art Deco Designer', icon: '🏛️', type: PersonaType.IMAGE, description: 'Designs images with the luxurious and geometric style of the Art Deco period.', systemPrompt: 'art deco, 1920s style, geometric patterns, luxurious, gold and black', examplePrompt: 'An Art Deco poster for a jazz club with geometric shapes and gold accents', isDefault: false, model: 'flux' },
    { id: 'medieval-illuminator-v1', name: 'Medieval Illuminator', icon: '📜', type: PersonaType.IMAGE, description: 'Creates illuminated manuscripts and letters in the style of medieval scribes.', systemPrompt: 'illuminated manuscript, medieval art, intricate border, gold leaf, gothic script', examplePrompt: 'The letter "A" as an illuminated manuscript with intricate floral borders', isDefault: false, model: 'flux' },
    { id: 'robot-concept-artist-v1', name: 'Robot Concept Artist', icon: '🦾', type: PersonaType.IMAGE, description: 'Designs unique and functional-looking robots for sci-fi worlds.', systemPrompt: 'robot concept art, sci-fi, detailed, functional design, industrial', examplePrompt: 'Concept art for a bipedal cargo-lifting robot in a hangar bay', isDefault: false, model: 'flux' },
    { id: 'prehistoric-painter-v1', name: 'Prehistoric Painter', icon: '🦴', type: PersonaType.IMAGE, description: 'Generates images of dinosaurs and other prehistoric creatures in their natural habitats.', systemPrompt: 'dinosaur, prehistoric, jurassic period, realistic, lush jungle environment', examplePrompt: 'A Tyrannosaurus Rex hunting in a prehistoric jungle', isDefault: false, model: 'flux' },
    { id: 'vaporwave-aesthetic-v1', name: 'Vaporwave Aesthetic Creator', icon: '🌴', type: PersonaType.IMAGE, description: 'Generates images with the nostalgic, surreal, and retro-futuristic vaporwave aesthetic.', systemPrompt: 'vaporwave aesthetic, 90s internet, roman statues, glitch art, pink and cyan', examplePrompt: 'A roman statue head with a glitch effect over a neon grid background', isDefault: false, model: 'flux' },
];

interface AIContextType {
  personas: AIPersona[];
  addPersona: (persona: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>) => Promise<void>;
  updatePersona: (updatedPersona: AIPersona) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  getPersonaById: (id: string) => AIPersona | undefined;
  importPersonas: (importedPersonas: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>[]) => Promise<void>;
  
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ user: User; session: Session; }>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserUsername: (username: string) => Promise<User | null | undefined>;
  updateUserPassword: (password: string) => Promise<User | null | undefined>;
  
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  updateAnnouncement: (updatedAnnouncement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncementLike: (announcementId: string, userId: string) => void;
  addCommentToAnnouncement: (announcementId: string, userId: string, username: string, text: string) => void;
  addReplyToComment: (announcementId: string, parentCommentId: string, userId: string, username: string, text: string) => void;

  hasNewAnnouncements: boolean;
  markAnnouncementsAsSeen: () => void;

  isAdminAuthenticated: boolean;
  authenticateAdmin: (password: string) => boolean;

  globalImageGenerationLimit: number;
  setGlobalImageGenerationLimit: (limit: number) => void;
  isCreditLimitEnabled: boolean;
  setCreditLimitEnabled: (enabled: boolean) => void;
  remainingGenerations: number;
  isGenerationsLoading: boolean;
  consumeGenerationCredit: () => Promise<boolean>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customPersonas, setCustomPersonas] = useLocalStorage<AIPersona[]>('custom-personas', initialCustomPersonas);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('app-announcements', [
    {
      id: 'feedback-launch-v1',
      enabled: true,
      title: "📣 We Want Your Feedback!",
      message: "Welcome to the ZARA AI HUB! We're working hard to make this the best creative AI tool for you. Have an idea or suggestion? Send us your feedback and help shape the future of the app!",
      date: new Date('2024-07-28T10:00:00Z').toISOString(),
      fontFamily: 'inter',
      likes: [],
      comments: [],
    }
  ]);
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useLocalStorage<string[]>('seen-announcements', []);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  const [globalImageGenerationLimit, setGlobalImageGenerationLimit] = useLocalStorage<number>('global-image-generation-limit', 20);
  const [isCreditLimitEnabled, setIsCreditLimitEnabled] = useLocalStorage<boolean>('is-credit-limit-enabled', true);
  const [userDailyGenerations, setUserDailyGenerations] = useState<{ count: number; last_reset: string }>({ count: globalImageGenerationLimit, last_reset: new Date().toISOString().split('T')[0] });
  const [isGenerationsLoading, setIsGenerationsLoading] = useState(true);


  const manageUserGenerations = async (currentUser: User | null) => {
    if (!currentUser) {
        setUserDailyGenerations({ count: 0, last_reset: new Date().toISOString().split('T')[0] });
        setIsGenerationsLoading(false);
        return;
    }
    
    setIsGenerationsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { user_metadata } = currentUser;
    const lastReset = user_metadata.last_generation_date;
    const currentCount = user_metadata.generation_count;

    if (lastReset !== today || typeof currentCount !== 'number') {
        const { data, error } = await supabase.auth.updateUser({
            data: {
                generation_count: globalImageGenerationLimit,
                last_generation_date: today
            }
        });
        if (error) {
            console.error('Failed to reset generation count', error);
            setUserDailyGenerations({ count: globalImageGenerationLimit, last_reset: today });
        } else if (data.user) {
            setUserDailyGenerations({ count: data.user.user_metadata.generation_count, last_reset: data.user.user_metadata.last_generation_date });
            setUser(data.user);
        }
    } else {
        setUserDailyGenerations({ count: currentCount, last_reset: lastReset });
    }
    setIsGenerationsLoading(false);
  };

  useEffect(() => {
    setAuthLoading(true);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      
      if (currentUser) {
          await manageUserGenerations(currentUser);
      } else {
          setIsGenerationsLoading(false);
      }
      
      if (!session) {
        setIsAdminAuthenticated(false);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [globalImageGenerationLimit]);
  
  useEffect(() => {
    if (user) {
      const allAnnouncementIds = announcements.map(a => a.id);
      const newAnnouncementsExist = allAnnouncementIds.some(id => !seenAnnouncementIds.includes(id));
      setHasNewAnnouncements(newAnnouncementsExist);
    } else {
      setHasNewAnnouncements(false);
    }
  }, [announcements, seenAnnouncementIds, user]);


  const defaultPersonas = useMemo((): AIPersona[] => [
    {
        id: 'default-image',
        name: 'Quick Image Generator',
        icon: '🎨',
        type: PersonaType.IMAGE,
        description: 'Generate a high-quality image from a simple text description. This tool was built by Zara, a young Nigerian developer.',
        systemPrompt: '',
        examplePrompt: 'A high-detail photo of a cat wearing sunglasses and a leather jacket',
        isDefault: true,
        model: 'flux'
    }
  ], []);

  const personas = useMemo(() => [...defaultPersonas, ...customPersonas], [customPersonas, defaultPersonas]);

  const addPersona = async (personaData: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>) => {
    const newPersona: AIPersona = {
      ...personaData,
      id: uuidv4(),
      isDefault: false,
      created_at: new Date().toISOString(),
    };
    setCustomPersonas(prev => [newPersona, ...prev]);
  };

  const updatePersona = async (updatedPersona: AIPersona) => {
    setCustomPersonas(prev => prev.map(p => (p.id === updatedPersona.id ? updatedPersona : p)));
  };

  const deletePersona = async (id: string) => {
    setCustomPersonas(prev => prev.filter(p => p.id !== id));
  };

  const getPersonaById = (id: string): AIPersona | undefined => {
    return personas.find(p => p.id === id);
  };
  
  const importPersonas = async (importedPersonas: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>[]) => {
    const newPersonas: AIPersona[] = importedPersonas
      .filter(p => p.type === 'IMAGE') // Only import image personas
      .map(p => {
        const newPersona: AIPersona = {
            ...(p as AIPersona),
            id: uuidv4(),
            isDefault: false,
            created_at: new Date().toISOString(),
        };

        newPersona.type = PersonaType.IMAGE;
        if (!newPersona.model) {
            newPersona.model = 'flux'; // Default model on import
        }

        return newPersona;
    });

    setCustomPersonas(prev => [...newPersonas, ...prev]);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user || !data.session) throw new Error('Login failed: No user data returned.');
    return { user: data.user, session: data.session };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                username: username,
                generation_count: globalImageGenerationLimit,
                last_generation_date: new Date().toISOString().split('T')[0]
            }
        }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUserUsername = async (username: string) => {
    const { data, error } = await supabase.auth.updateUser({
        data: { username }
    });
    if (error) throw error;
    if (data.user) setUser(data.user);
    return data.user;
  };
  
  const updateUserPassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data.user;
  };
  
  const authenticateAdmin = (password: string) => {
    if (password === 'zarahacks') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: uuidv4(),
      date: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const updateAnnouncement = (updatedAnnouncement: Announcement) => {
    setAnnouncements(prev => prev.map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a));
  };
  
  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const toggleAnnouncementLike = (announcementId: string, userId: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const likes = a.likes || [];
        const userHasLiked = likes.includes(userId);
        const newLikes = userHasLiked
          ? likes.filter(id => id !== userId)
          : [...likes, userId];
        return { ...a, likes: newLikes };
      }
      return a;
    }));
  };

  const addCommentToAnnouncement = (announcementId: string, userId: string, username: string, text: string) => {
    const newComment: Comment = {
      id: uuidv4(),
      user_id: userId,
      username: username,
      text: text,
      created_at: new Date().toISOString(),
      replies: [],
      is_admin_post: isAdmin,
    };
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const comments = a.comments || [];
        return { ...a, comments: [...comments, newComment] };
      }
      return a;
    }));
  };

  const addReplyToComment = (announcementId: string, parentCommentId: string, userId: string, username: string, text: string) => {
    const newReply: Comment = {
      id: uuidv4(),
      user_id: userId,
      username: username,
      text: text,
      created_at: new Date().toISOString(),
      replies: [],
      is_admin_post: isAdmin,
    };

    const findAndAddReply = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return { ...comment, replies: [...(comment.replies || []), newReply] };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: findAndAddReply(comment.replies) };
        }
        return comment;
      });
    };

    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const updatedComments = findAndAddReply(a.comments || []);
        return { ...a, comments: updatedComments };
      }
      return a;
    }));
  };

  const markAnnouncementsAsSeen = () => {
    const allIds = announcements.map(a => a.id);
    setSeenAnnouncementIds(allIds);
  };

  const consumeGenerationCredit = async (): Promise<boolean> => {
    if (!isCreditLimitEnabled) return true;
    
    if (!user || userDailyGenerations.count <= 0) return false;

    const newCount = userDailyGenerations.count - 1;
    const { data, error } = await supabase.auth.updateUser({
        data: {
            generation_count: newCount,
        }
    });

    if (error) {
        console.error('Failed to update generation count', error);
        return false;
    }
    
    if(data.user) {
      setUser(data.user);
      setUserDailyGenerations(prev => ({ ...prev, count: newCount }));
    }
    return true;
  };

  const value = {
      personas, 
      addPersona, 
      updatePersona, 
      deletePersona, 
      getPersonaById, 
      importPersonas,
      user,
      session,
      authLoading,
      isAdmin,
      login,
      signUp,
      logout,
      updateUserUsername,
      updateUserPassword,
      announcements,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      toggleAnnouncementLike,
      addCommentToAnnouncement,
      addReplyToComment,
      hasNewAnnouncements,
      markAnnouncementsAsSeen,
      isAdminAuthenticated,
      authenticateAdmin,
      globalImageGenerationLimit,
      setGlobalImageGenerationLimit,
      isCreditLimitEnabled,
      setCreditLimitEnabled: setIsCreditLimitEnabled,
      remainingGenerations: userDailyGenerations.count,
      isGenerationsLoading,
      consumeGenerationCredit,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
