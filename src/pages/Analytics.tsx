import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';

export default function Analytics() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const centerX = width / 2;
    const centerY = height / 2;

    // Data for orbital visualization
    const data = [
      { id: 1, label: "Lead Uploaded", date: "2024-03-01", radius: 100, speed: 0.02, color: "#3b82f6" },
      { id: 2, label: "AI Cleaned", date: "2024-03-02", radius: 150, speed: 0.015, color: "#8b5cf6" },
      { id: 3, label: "Email Found", date: "2024-03-03", radius: 200, speed: 0.01, color: "#10b981" },
      { id: 4, label: "Email Sent", date: "2024-03-04", radius: 250, speed: 0.008, color: "#f59e0b" },
    ];

    // Draw orbits
    svg.selectAll(".orbit")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "orbit")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", d => d.radius)
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Draw nodes
    const nodes = svg.selectAll(".node")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "node");

    nodes.append("circle")
      .attr("r", 12)
      .attr("fill", d => d.color)
      .attr("filter", "drop-shadow(0 0 8px rgba(0,0,0,0.1))");

    nodes.append("text")
      .text(d => d.label)
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#64748b");

    // Animation loop
    let angle = 0;
    const animate = () => {
      angle += 0.01;
      nodes.attr("transform", d => {
        const x = centerX + d.radius * Math.cos(angle * d.speed * 100);
        const y = centerY + d.radius * Math.sin(angle * d.speed * 100);
        return `translate(${x}, ${y})`;
      });
      requestAnimationFrame(animate);
    };

    animate();

    // Center point
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 40)
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.1);
    
    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-weight", "bold")
      .attr("fill", "#3b82f6")
      .text("PIPELINE");

  }, []);

  return (
    <div className="flex flex-col gap-8 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 neumorph rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[600px]">
          <h3 className="text-2xl font-display font-bold mb-8 self-start">Orbital Pipeline Timeline</h3>
          <svg ref={svgRef} className="w-full max-w-[800px] h-auto" />
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="neumorph rounded-[2.5rem] p-8">
            <h4 className="font-bold mb-4">Pipeline Health</h4>
            <div className="space-y-4">
              {[
                { label: "Active", value: 75, color: "bg-blue-500" },
                { label: "Paused", value: 15, color: "bg-amber-500" },
                { label: "Completed", value: 10, color: "bg-emerald-500" }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-500">{item.label}</span>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className={cn("h-full", item.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="neumorph rounded-[2.5rem] p-8 flex-1">
            <h4 className="font-bold mb-4">Top Channels</h4>
            <div className="space-y-6">
              {[
                { name: "LinkedIn", score: 8.4 },
                { name: "Direct Web", score: 7.2 },
                { name: "Referrals", score: 6.8 },
                { name: "Cold Email", score: 5.9 }
              ].map((channel, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{channel.name}</span>
                  <div className="neumorph-sm px-3 py-1 rounded-lg text-xs font-bold text-blue-600">
                    {channel.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils.ts';
