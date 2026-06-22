// Three.js Interactive 3D Hero Sphere Animation
document.addEventListener('DOMContentLoaded', () => {
    initHeroThree();
});

function initHeroThree() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Check if THREE is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js CDN is not loaded.');
        return;
    }

    // Get container dimensions
    const container = canvas.parentElement;
    let width = container.clientWidth;
    let height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 210;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Main rotating group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Inner glowing wireframe sphere (glowing structural core)
    const innerGeo = new THREE.SphereGeometry(45, 12, 12);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x2563EB, // Brand Blue
        wireframe: true,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Outer constellation particles setup
    const particleCount = 150;
    const sphereRadius = 75;
    
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = [];
    const velocities = [];
    const phases = [];

    for (let i = 0; i < particleCount; i++) {
        // Uniform sphere surface point distribution
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);

        const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
        const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
        const z = sphereRadius * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        originalPositions.push(new THREE.Vector3(x, y, z));
        
        // Dynamic drift parameters
        velocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        ));
        phases.push(Math.random() * Math.PI * 2);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Dynamic glowing radial texture for high visual quality
    function createGlowTexture() {
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 16;
        glowCanvas.height = 16;
        const ctx = glowCanvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)'); // Glow color
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(glowCanvas);
    }

    const particleMaterial = new THREE.PointsMaterial({
        size: 5.5,
        map: createGlowTexture(),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particleSystem);

    // 3. Dynamic Lines Geometry
    const maxConnections = 350;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);
    
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    mainGroup.add(lineSegments);

    // 4. Ambient floating dust particles (luxury space glow)
    const dustCount = 60;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 320;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 320;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 320;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
        size: 2,
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const dustSystem = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustSystem);

    // Mouse position variables & setup
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let mouse3D = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Intersection tracking plane

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.025;
        mouseY = (event.clientY - windowHalfY) * 0.025;

        // Projects the 2D cursor coordinate into 3D space to warp nodes
        const mouse2D = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse2D, camera);
        raycaster.ray.intersectPlane(plane, mouse3D);
    });

    // Window Resize Handling
    window.addEventListener('resize', () => {
        width = container.clientWidth;
        height = container.clientHeight || 500;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });

    let time = 0;

    // Render loop
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.006;

        // Constant orbit rotation
        mainGroup.rotation.y += 0.0015;
        mainGroup.rotation.x += 0.0006;
        
        dustSystem.rotation.y -= 0.0002;
        dustSystem.rotation.x += 0.0001;

        // Smooth mouse parallax lerp
        targetX += (mouseX - targetX) * 0.07;
        targetY += (mouseY - targetY) * 0.07;

        mainGroup.position.x = targetX * 0.3;
        mainGroup.position.y = -targetY * 0.3;

        // Update outer nodes positions (Drift + Magnetic Warp)
        const posAttr = particleGeometry.attributes.position;
        
        // Transform the 3D mouse vector back to coordinate system of mainGroup
        const localMouse3D = mouse3D.clone().applyMatrix4(mainGroup.matrixWorld.clone().invert());

        for (let i = 0; i < particleCount; i++) {
            const orig = originalPositions[i];
            const phase = phases[i];

            // 1. Organic swim motion
            let x = orig.x + Math.sin(time + phase) * 3.5;
            let y = orig.y + Math.cos(time * 1.2 + phase) * 3.5;
            let z = orig.z + Math.sin(time * 0.8 + phase) * 3.5;

            const currentPos = new THREE.Vector3(x, y, z);

            // 2. Interactive warp: push nodes away when cursor is close
            const distToMouse = currentPos.distanceTo(localMouse3D);
            if (distToMouse < 65) {
                const force = (65 - distToMouse) / 65;
                const pushDirection = currentPos.clone().sub(localMouse3D).normalize();
                currentPos.addScaledVector(pushDirection, force * 16);
            }

            posAttr.setXYZ(i, currentPos.x, currentPos.y, currentPos.z);
        }
        posAttr.needsUpdate = true;

        // Recompute connections on the fly
        let lineIdx = 0;
        const points = posAttr.array;
        
        const linePosAttr = lineGeometry.attributes.position;
        const lineColorAttr = lineGeometry.attributes.color;

        const maxDist = 42;
        const colorBrand = new THREE.Color(0x2563EB); // Royal Blue
        const colorGlow = new THREE.Color(0x38BDF8);  // Cyan Accent

        for (let i = 0; i < particleCount; i++) {
            if (lineIdx >= maxConnections) break;

            const x1 = points[i * 3];
            const y1 = points[i * 3 + 1];
            const z1 = points[i * 3 + 2];

            for (let j = i + 1; j < particleCount; j++) {
                if (lineIdx >= maxConnections) break;

                const x2 = points[j * 3];
                const y2 = points[j * 3 + 1];
                const z2 = points[j * 3 + 2];

                const dx = x1 - x2;
                const dy = y1 - y2;
                const dz = z1 - z2;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDist) {
                    const ratio = 1.0 - (dist / maxDist);
                    
                    // Line nodes positions
                    linePosAttr.setXYZ(lineIdx * 2, x1, y1, z1);
                    linePosAttr.setXYZ(lineIdx * 2 + 1, x2, y2, z2);

                    // Dynamic gradient colors based on line length
                    const c1 = colorGlow.clone().lerp(colorBrand, 1.0 - ratio);
                    
                    lineColorAttr.setXYZ(lineIdx * 2, c1.r * ratio, c1.g * ratio, c1.b * ratio);
                    lineColorAttr.setXYZ(lineIdx * 2 + 1, c1.r * ratio, c1.g * ratio, c1.b * ratio);

                    lineIdx++;
                }
            }
        }

        // Flush remaining connection vertices to 0
        for (let k = lineIdx; k < maxConnections; k++) {
            linePosAttr.setXYZ(k * 2, 0, 0, 0);
            linePosAttr.setXYZ(k * 2 + 1, 0, 0, 0);
            
            lineColorAttr.setXYZ(k * 2, 0, 0, 0);
            lineColorAttr.setXYZ(k * 2 + 1, 0, 0, 0);
        }

        linePosAttr.needsUpdate = true;
        lineColorAttr.needsUpdate = true;

        renderer.render(scene, camera);
    };

    animate();
}
